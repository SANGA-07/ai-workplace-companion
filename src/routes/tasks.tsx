import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Tag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/tasks-store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Prestige AI" },
      { name: "description", content: "Organize and track your tasks with categories and dark mode." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const {
    tasks,
    categories,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    addCategory,
  } = useTasks();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "Work");
  const [newCat, setNewCat] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return tasks;
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks.filter((t) => t.category === filter);
  }, [tasks, filter]);

  const counts = useMemo(() => {
    const active = tasks.filter((t) => !t.completed).length;
    return { total: tasks.length, active, done: tasks.length - active };
  }, [tasks]);

  const submit = () => {
    if (!title.trim()) return;
    addTask(title, category);
    setTitle("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <ListTodo className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A calm space to capture, categorize, and complete your work.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Add a task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="What needs doing?"
                  className="flex-1"
                />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={submit} disabled={!title.trim()}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-display text-base">
                {filter === "all"
                  ? "All tasks"
                  : filter === "active"
                    ? "Active"
                    : filter === "completed"
                      ? "Completed"
                      : filter}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {filtered.length}
                </span>
              </CardTitle>
              {counts.done > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nothing here yet. Add your first task above.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((t) => (
                    <li key={t.id} className="group flex items-center gap-3 py-3">
                      <button
                        onClick={() => toggleTask(t.id)}
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {t.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "truncate text-sm",
                            t.completed && "text-muted-foreground line-through",
                          )}
                        >
                          {t.title}
                        </p>
                      </div>
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        {t.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteTask(t.id)}
                        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Total" value={counts.total} />
              <Row label="Active" value={counts.active} />
              <Row label="Completed" value={counts.done} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <FilterBtn current={filter} value="all" onClick={setFilter}>All</FilterBtn>
              <FilterBtn current={filter} value="active" onClick={setFilter}>Active</FilterBtn>
              <FilterBtn current={filter} value="completed" onClick={setFilter}>Completed</FilterBtn>
              <div className="my-2 h-px bg-border" />
              {categories.map((c) => (
                <FilterBtn key={c} current={filter} value={c} onClick={setFilter}>
                  <Tag className="h-3.5 w-3.5" /> {c}
                </FilterBtn>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">New category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="e.g. Errands"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addCategory(newCat);
                      setNewCat("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    addCategory(newCat);
                    setNewCat("");
                  }}
                  disabled={!newCat.trim()}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-display font-semibold">{value}</span>
    </div>
  );
}

function FilterBtn({
  current,
  value,
  onClick,
  children,
}: {
  current: string;
  value: string;
  onClick: (v: string) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}
