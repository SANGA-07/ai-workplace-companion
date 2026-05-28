import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { ToolShell } from "@/components/tool-shell";
import { MarkdownView } from "@/components/markdown-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Prestige AI" },
      { name: "description", content: "Generate polished professional emails by tone and audience." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Persuasive", "Concise", "Formal", "Apologetic", "Enthusiastic"];

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [audience, setAudience] = useState("Engineering manager");
  const [tone, setTone] = useState("Professional");
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [copied, setCopied] = useState(false);

  const mut = useMutation({
    mutationFn: (input: { topic: string; audience: string; tone: string; keyPoints: string }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to generate email"),
  });

  const handleCopy = async () => {
    if (!mut.data?.text) return;
    await navigator.clipboard.writeText(mut.data.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell
      icon={<Mail className="h-5 w-5" />}
      title="Smart Email Generator"
      description="Describe what you need to say. We'll write it in the tone your audience expects."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="audience">Audience</Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. CFO, new hire, client"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic / purpose</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Request a 1-week extension on the Q3 launch deadline."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kp">Key points (optional)</Label>
              <Textarea
                id="kp"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="One per line"
                rows={4}
              />
            </div>
            <Button
              className="w-full"
              disabled={!topic.trim() || mut.isPending}
              onClick={() => mut.mutate({ topic, audience, tone, keyPoints })}
            >
              {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Draft</CardTitle>
            {mut.data?.text && (
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {mut.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Composing your email...
              </div>
            )}
            {!mut.isPending && !mut.data && (
              <p className="text-sm text-muted-foreground">Your generated email will appear here.</p>
            )}
            {mut.data?.text && (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {mut.data.text}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      {mut.data?.text && <MarkdownView className="sr-only" text={mut.data.text} />}
    </ToolShell>
  );
}
