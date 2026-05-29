import { useEffect, useState, useCallback } from "react";

export type Task = {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: number;
};

const KEY = "prestige.tasks.v1";
const CATS_KEY = "prestige.taskCats.v1";
const DEFAULT_CATS = ["Work", "Personal", "Ideas"];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(read<Task[]>(KEY, []));
    setCategories(read<string[]>(CATS_KEY, DEFAULT_CATS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(KEY, tasks);
  }, [tasks, hydrated]);
  useEffect(() => {
    if (hydrated) write(CATS_KEY, categories);
  }, [categories, hydrated]);

  const addTask = useCallback((title: string, category: string) => {
    const t: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [t, ...prev]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const addCategory = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setCategories((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  }, []);

  return {
    tasks,
    categories,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    addCategory,
  };
}
