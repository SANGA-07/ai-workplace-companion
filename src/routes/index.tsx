import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { createNewThread, useThreads } from "@/lib/chat-threads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prestige AI — Technology Learning Institute Assistant" },
      {
        name: "description",
        content:
          "AI assistant for a Technology Learning Institution: emails, meetings, academic planning, and risk research.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  { title: "Smart Email Generator", desc: "Polished, properly formatted institutional emails.", href: "/email" as const, icon: Mail },
  { title: "Meeting Notes Summarizer", desc: "Key points, actions and a next meeting scheduled a day ahead.", href: "/notes" as const, icon: FileText },
  { title: "Academic Planner", desc: "Keep applicant, course, test and results data up to date.", href: "/planner" as const, icon: ListChecks },
  { title: "Risk Research", desc: "Weather, load-shedding, water, cyberattacks — anything that could delay the calendar.", href: "/research" as const, icon: Search },
  { title: "AI Chatbot", desc: "Conversational assistant with thread history.", href: "/chat" as const, icon: MessageCircle },
];

function Dashboard() {
  const navigate = useNavigate();
  const { threads, persist } = useThreads();
  const [prompt, setPrompt] = useState("");

  const launch = () => {
    const text = prompt.trim();
    if (!text) return;
    const t = createNewThread();
    t.title = text.length > 48 ? text.slice(0, 48) + "…" : text;
    persist([t, ...threads]);
    navigate({
      to: "/chat/$threadId",
      params: { threadId: t.id },
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Technology Learning Institute · Workplace AI
        </div>
        <h1
          className="font-display text-5xl font-extrabold tracking-tight text-primary sm:text-6xl"
          style={{
            textShadow:
              "0 0 18px oklch(0.82 0.13 60 / 0.55), 0 0 36px oklch(0.82 0.13 60 / 0.25)",
          }}
        >
          Prestige AI
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Draft emails, summarize meetings, plan academic operations, and stay ahead of risks to the
          academic calendar — all from one place.
        </p>
      </div>

      {/* Center prompt engine */}
      <Card className="mx-auto mb-10 max-w-3xl border-primary/20 shadow-[0_8px_40px_-12px_oklch(0.82_0.13_60/0.35)]">
        <CardContent className="p-4 sm:p-5">
          <label htmlFor="prompt-engine" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ask Prestige AI
          </label>
          <Textarea
            id="prompt-engine"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                launch();
              }
            }}
            placeholder="e.g. Draft an email to applicants confirming next week's entrance test, or summarise today's lecturer meeting…"
            rows={4}
            className="resize-none border-0 bg-muted/40 text-base focus-visible:ring-1 focus-visible:ring-primary/40"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Press ⌘/Ctrl + Enter to send
            </span>
            <Button onClick={launch} disabled={!prompt.trim()} className="ml-auto">
              <Send className="mr-1.5 h-4 w-4" /> Start
            </Button>
          </div>
        </CardContent>
      </Card>

      <AiDisclaimer className="mx-auto mb-8 max-w-md" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} to={f.href} className="group">
            <Card className="h-full border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.96_0.04_65)] text-[oklch(0.72_0.14_55)]">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="font-display text-lg">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
