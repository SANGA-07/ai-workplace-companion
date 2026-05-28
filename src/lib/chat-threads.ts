import { useCallback, useState, useEffect } from "react";
import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "prestige.chat.threads.v1";

function read(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatThread[]) : [];
  } catch {
    return [];
  }
}

function write(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(threads));
}

function genId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createNewThread(): ChatThread {
  return { id: genId(), title: "New conversation", updatedAt: Date.now(), messages: [] };
}

export function useThreads() {
  const [threads, setThreads] = useState<ChatThread[]>(() => read());

  // sync on mount in case hydration ran with empty stub
  useEffect(() => {
    setThreads(read());
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) setThreads(read());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const persist = useCallback((next: ChatThread[]) => {
    write(next);
    setThreads(next);
  }, []);

  const upsertThread = useCallback(
    (thread: ChatThread) => {
      const current = read();
      const idx = current.findIndex((t) => t.id === thread.id);
      const next = idx >= 0 ? current.map((t) => (t.id === thread.id ? thread : t)) : [thread, ...current];
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      persist(next);
    },
    [persist],
  );

  const deleteThread = useCallback(
    (id: string) => persist(read().filter((t) => t.id !== id)),
    [persist],
  );

  const getThread = useCallback((id: string) => read().find((t) => t.id === id), []);

  return { threads, upsertThread, deleteThread, getThread, persist };
}

export function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  return text.length > 48 ? text.slice(0, 48) + "…" : text || "New conversation";
}
