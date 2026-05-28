import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-foreground/80",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
      <span>AI-generated content may require human review.</span>
    </div>
  );
}
