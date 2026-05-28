import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ToolShell } from "@/components/tool-shell";
import { MarkdownView } from "@/components/markdown-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Prestige AI" },
      { name: "description", content: "Structured briefings and insights on any topic." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"brief" | "standard" | "deep">("standard");

  const mut = useMutation({
    mutationFn: (input: { topic: string; depth: "brief" | "standard" | "deep" }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to research"),
  });

  return (
    <ToolShell
      icon={<Search className="h-5 w-5" />}
      title="AI Research Assistant"
      description="Get a structured briefing with insights, opportunities, risks, and next steps."
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. impact of generative AI on customer support"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Depth</Label>
              <Select value={depth} onValueChange={(v) => setDepth(v as "brief" | "standard" | "deep")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            disabled={topic.trim().length < 3 || mut.isPending}
            onClick={() => mut.mutate({ topic, depth })}
          >
            {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Research topic
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-display text-lg">Briefing</CardTitle>
        </CardHeader>
        <CardContent>
          {mut.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Compiling insights...
            </div>
          )}
          {!mut.isPending && !mut.data && (
            <p className="text-sm text-muted-foreground">Your research briefing will appear here.</p>
          )}
          {mut.data?.text && <MarkdownView text={mut.data.text} />}
        </CardContent>
      </Card>
    </ToolShell>
  );
}
