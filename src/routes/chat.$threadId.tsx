import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { useThreads, deriveTitle, type ChatThread } from "@/lib/chat-threads";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
});

const transport = new DefaultChatTransport({ api: "/api/chat" });

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const { getThread, upsertThread } = useThreads();

  const initialMessages = useMemo<UIMessage[]>(
    () => getThread(threadId)?.messages ?? [],
    [threadId, getThread],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => toast.error(err.message || "Chat error"),
  });

  // Persist messages when stream completes (status returns to "ready")
  const lastSavedRef = useRef<string>("");
  useEffect(() => {
    if (status !== "ready" || messages.length === 0) return;
    const fingerprint = `${messages.length}:${messages[messages.length - 1]?.id ?? ""}`;
    if (fingerprint === lastSavedRef.current) return;
    lastSavedRef.current = fingerprint;
    const thread: ChatThread = {
      id: threadId,
      title: deriveTitle(messages),
      updatedAt: Date.now(),
      messages,
    };
    upsertThread(thread);
  }, [status, messages, threadId, upsertThread]);

  const handleSubmit = (msg: PromptInputMessage) => {
    if (!msg.text.trim()) return;
    void sendMessage({ text: msg.text });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div key={threadId} className="flex flex-1 flex-col min-w-0">
      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Sparkles className="h-7 w-7 text-gold" />
                </div>
              }
              title="How can I help your work today?"
              description="Ask about emails, planning, meetings, or anything you need help thinking through."
            />
          ) : (
            messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <MessageResponse>{text}</MessageResponse>
                    ) : (
                      <span className="whitespace-pre-wrap">{text}</span>
                    )}
                  </MessageContent>
                </Message>
              );
            })
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea placeholder="Message your AI assistant…" autoFocus />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
          <AiDisclaimer className="mt-2" />
        </div>
      </div>
    </div>
  );
}
