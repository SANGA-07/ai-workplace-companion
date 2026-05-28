import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getLovableModel } from "./ai-gateway.server";

async function run(system: string, prompt: string) {
  const { text } = await generateText({
    model: getLovableModel(),
    system,
    prompt,
  });
  return { text };
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic: z.string().min(1).max(2000),
      audience: z.string().min(1).max(200),
      tone: z.string().min(1).max(50),
      keyPoints: z.string().max(2000).optional().default(""),
    }),
  )
  .handler(({ data }) =>
    run(
      `You are an expert business communications writer. Produce a polished, professional email tailored to the audience and tone. Output ONLY the final email with the structure:\nSubject: <subject>\n\n<greeting>\n\n<body in clear short paragraphs>\n\n<sign-off>\nNo commentary, no markdown fences.`,
      `Audience: ${data.audience}\nTone: ${data.tone}\nTopic / purpose: ${data.topic}\nKey points to cover: ${data.keyPoints || "(none provided — infer reasonable defaults)"}`,
    ),
  );

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notes: z.string().min(20).max(20000) }))
  .handler(({ data }) =>
    run(
      `You are a meeting analyst. Read the raw meeting notes and produce a clean, scannable Markdown summary with EXACTLY these sections, in order:\n\n## Executive Summary\n2-3 sentence overview.\n\n## Key Discussion Points\nBullet list of decisions and important topics.\n\n## Action Items\nTable with columns: Owner | Task | Deadline. If a field is unknown, write "TBD".\n\n## Deadlines & Dates\nBullet list of dates mentioned.\n\n## Open Questions\nBullet list of unresolved items.\n\nBe concise and precise. Do not invent facts.`,
      `Meeting notes:\n\n${data.notes}`,
    ),
  );

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tasks: z.string().min(5).max(5000),
      hoursAvailable: z.number().min(1).max(24).default(8),
      context: z.string().max(1000).optional().default(""),
    }),
  )
  .handler(({ data }) =>
    run(
      `You are a productivity coach using the Eisenhower matrix and time-blocking. Given a raw list of tasks, output Markdown with:\n\n## Prioritized Plan\nNumbered list. Each item: **Task** — Priority (P1/P2/P3) — Est. duration — Why.\n\n## Suggested Schedule (Today)\nTable: Time Block | Task | Focus Level. Fit within the available hours, include short breaks.\n\n## Defer / Delegate\nBullet list of tasks to push or hand off, with reason.\n\nBe specific and actionable.`,
      `Available focus hours today: ${data.hoursAvailable}\nContext: ${data.context || "(none)"}\nRaw tasks:\n${data.tasks}`,
    ),
  );

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic: z.string().min(3).max(500),
      depth: z.enum(["brief", "standard", "deep"]).default("standard"),
    }),
  )
  .handler(({ data }) =>
    run(
      `You are a senior research analyst. Produce a structured Markdown briefing on the given topic. Sections (in order):\n\n## TL;DR\n3 bullet points.\n\n## Background\nShort context paragraph.\n\n## Key Insights\n5-7 bullet insights, each one sentence.\n\n## Opportunities & Risks\nTwo subsections with bullets.\n\n## Recommended Next Steps\nNumbered list of concrete actions.\n\nDepth requested: ${data.depth}. Be balanced and avoid speculation. If something is uncertain, say so.`,
      `Research topic: ${data.topic}`,
    ),
  );
