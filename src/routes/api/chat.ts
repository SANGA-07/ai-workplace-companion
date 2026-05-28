import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getLovableModel } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        try {
          const result = streamText({
            model: getLovableModel(),
            system:
              "You are an AI Workplace Productivity Assistant. You help professionals draft emails, plan tasks, summarize meetings, and research topics. Be concise, structured, and actionable. Use Markdown when helpful. Always remind users to review AI-generated content when stakes are high.",
            messages: convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (err) {
          console.error("chat error", err);
          return new Response("AI gateway error", { status: 500 });
        }
      },
    },
  },
});
