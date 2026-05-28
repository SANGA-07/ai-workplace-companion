import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ToolShell } from "@/components/tool-shell";
import { MarkdownView } from "@/components/markdown-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Prestige AI" },
      { name: "description", content: "Prioritize your day with AI scheduling and time-blocking." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState(8);
  const [context, setContext] = useState("");

  const mut = useMutation({
    mutationFn: (input: { tasks: string; hoursAvailable: number; context: string }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to plan"),
  });

  return (
    <ToolShell
      icon={<ListChecks className="h-5 w-5" />}
      title="AI Task Planner"
      description="Dump your to-do list. Get a prioritized plan and a realistic schedule."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Your tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hours">Focus hours today</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value) || 8)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctx">Context (optional)</Label>
                <Input
                  id="ctx"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. client demo Friday"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tasks">Tasks (one per line)</Label>
              <Textarea
                id="tasks"
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder={"Review PR #482\nDraft Q4 OKRs\nCall vendor about contract\nPrep design review slides"}
                rows={12}
              />
            </div>
            <Button
              className="w-full"
              disabled={tasks.trim().length < 5 || mut.isPending}
              onClick={() => mut.mutate({ tasks, hoursAvailable: hours, context })}
            >
              {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Build my plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Your plan</CardTitle>
          </CardHeader>
          <CardContent>
            {mut.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Prioritizing and scheduling...
              </div>
            )}
            {!mut.isPending && !mut.data && (
              <p className="text-sm text-muted-foreground">Your prioritized schedule will appear here.</p>
            )}
            {mut.data?.text && <MarkdownView text={mut.data.text} />}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
