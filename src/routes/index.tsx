import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Prestige AI" },
      { name: "description", content: "Your AI workplace assistant dashboard." },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    title: "Smart Email Generator",
    desc: "Draft polished emails tuned to tone and audience.",
    href: "/email" as const,
    icon: Mail,
  },
  {
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into key points, actions, and deadlines.",
    href: "/notes" as const,
    icon: FileText,
  },
  {
    title: "AI Task Planner",
    desc: "Prioritize your day and time-block it intelligently.",
    href: "/planner" as const,
    icon: ListChecks,
  },
  {
    title: "AI Research Assistant",
    desc: "Structured briefings and insights on any topic.",
    href: "/research" as const,
    icon: Search,
  },
  {
    title: "AI Chatbot",
    desc: "Conversational assistant with thread history.",
    href: "/chat" as const,
    icon: MessageCircle,
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 flex flex-col gap-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Workplace productivity, accelerated
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Welcome to <span className="text-primary">Prestige AI</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Your professional AI assistant for emails, meetings, planning, research, and conversation —
          all in one quiet, focused workspace.
        </p>
        <AiDisclaimer className="max-w-md" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} to={f.href} className="group">
            <Card className="h-full border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="font-display text-lg">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
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
