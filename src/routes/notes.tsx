import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ToolShell } from "@/components/tool-shell";
import { MarkdownView } from "@/components/markdown-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Prestige AI" },
      { name: "description", content: "Turn raw meeting notes into actions, deadlines, and key points." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: (notes: string) => fn({ data: { notes } }),
    onError: (e: Error) => toast.error(e.message || "Failed to summarize"),
  });

  return (
    <ToolShell
      icon={<FileText className="h-5 w-5" />}
      title="Meeting Notes Summarizer"
      description="Paste your raw meeting notes. Get key points, action items, and deadlines."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Raw notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Paste meeting transcript or notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Discussion points, decisions, who said what..."
                rows={16}
                className="font-mono text-xs"
              />
            </div>
            <Button
              className="w-full"
              disabled={notes.trim().length < 20 || mut.isPending}
              onClick={() => mut.mutate(notes)}
            >
              {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Summarize meeting
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {mut.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Extracting key points and actions...
              </div>
            )}
            {!mut.isPending && !mut.data && (
              <p className="text-sm text-muted-foreground">Your structured summary will appear here.</p>
            )}
            {mut.data?.text && <MarkdownView text={mut.data.text} />}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
