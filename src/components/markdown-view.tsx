import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function MarkdownView({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground",
        "prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90",
        "prose-table:text-sm prose-th:text-foreground prose-td:text-foreground/90",
        "prose-code:text-foreground prose-code:bg-muted prose-code:rounded prose-code:px-1",
        "prose-a:text-primary-glow",
        className,
      )}
    >
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
