"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'

interface Todo {
  id: string;
  text: string;
  createdAt: Date;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Todo[];
      setTodos(todosData);
    });

    return () => unsubscribe();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      try {
        await addDoc(collection(db, "todos"), {
          text: newTodo.trim(),
          createdAt: new Date()
        });
        setNewTodo("")
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  }

  const updateTodo = async (id: string, newText: string) => {
    try {
      const todoRef = doc(db, "todos", id);
      await updateDoc(todoRef, {
        text: newText
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="bg-primary text-primary-foreground p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold text-center">Todo List App</h1>
      </header>

      <main className="bg-card p-4 rounded-b-lg shadow-lg">
        <form onSubmit={addTodo} className="mb-4 flex gap-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task"
            className="flex-grow"
          />
          <Button type="submit">Add Task</Button>
        </form>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-2 bg-secondary p-2 rounded">
              {editingId === todo.id ? (
                <Input
                  type="text"
                  defaultValue={todo.text}
                  onBlur={(e) => updateTodo(todo.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateTodo(todo.id, e.currentTarget.value)
                    }
                  }}
                  autoFocus
                  className="flex-grow"
                />
              ) : (
                <span className="flex-grow">{todo.text}</span>
              )}
              <Button variant="ghost" size="icon" onClick={() => setEditingId(todo.id)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

