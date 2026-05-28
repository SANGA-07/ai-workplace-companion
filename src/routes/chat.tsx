import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createNewThread, useThreads } from "@/lib/chat-threads";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Prestige AI" },
      { name: "description", content: "Conversational AI assistant for your daily work." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const { threads, persist, deleteThread } = useThreads();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  // Idempotent bootstrap: if no threads, create one and navigate.
  // If at /chat without a threadId, navigate to most recent.
  useEffect(() => {
    if (activeId) return;
    if (threads.length === 0) {
      const t = createNewThread();
      persist([t]);
      navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
    } else {
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
    }
  }, [activeId, threads, navigate, persist]);

  const handleNew = () => {
    const t = createNewThread();
    persist([t, ...threads]);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (id: string) => {
    const remaining = threads.filter((t) => t.id !== id);
    deleteThread(id);
    if (id === activeId) {
      if (remaining.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id }, replace: true });
      } else {
        const t = createNewThread();
        persist([t]);
        navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-semibold">Conversations</span>
          </div>
          <Button size="sm" variant="default" onClick={handleNew}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2 pb-3">
          <div className="space-y-1">
            {threads.map((t) => {
              const isActive = t.id === activeId;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-md text-sm transition-colors",
                    isActive ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className={cn(
                      "flex-1 truncate px-3 py-2 text-left",
                      isActive ? "text-primary font-medium" : "text-foreground/80",
                    )}
                  >
                    {t.title}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                    className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {threads.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">No conversations yet</p>
            )}
          </div>
        </ScrollArea>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
