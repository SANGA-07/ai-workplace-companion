import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getLovableModel } from "./ai-gateway.server";

const INSTITUTION_CONTEXT = `You are Prestige AI, an AI assistant for a Technology Learning Institution. Your users are staff, lecturers, and administrators of the institution. Your context: applicants and enrolled students, ongoing courses, lecture schedules, tests, exam results, and the academic calendar. Always sound professional, clear, and student-focused.`;

async function run(system: string, prompt: string) {
  const { text } = await generateText({
    model: getLovableModel(),
    system: `${INSTITUTION_CONTEXT}\n\n${system}`,
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
      `You are an expert email writer for a Technology Learning Institution. Produce a polished, professional email tailored to the audience and tone. Follow strict email format:\n\nSubject: <clear, specific subject line>\n\nDear <recipient salutation>,\n\n<opening paragraph stating purpose>\n\n<body in clear short paragraphs covering each key point>\n\n<closing call to action or next step>\n\nKind regards,\n[Your Name]\n[Title], Prestige Technology Institute\n\nFollow the writer's prompts exactly. Use institutional language appropriate for students, applicants, lecturers, or partners. Output ONLY the final email — no commentary, no markdown fences.`,
      `Audience: ${data.audience}\nTone: ${data.tone}\nTopic / purpose: ${data.topic}\nKey points to cover: ${data.keyPoints || "(none provided — infer reasonable defaults)"}`,
    ),
  );

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notes: z.string().min(20).max(20000) }))
  .handler(({ data }) =>
    run(
      `You are a meeting analyst for a Technology Learning Institution. Read the raw notes and produce a clean, scannable Markdown summary with EXACTLY these sections, in order:\n\n## Executive Summary\n2-3 sentence overview.\n\n## Key Discussion Points\nBullet list of decisions and important topics.\n\n## Action Items\nTable with columns: Owner | Task | Deadline. If a field is unknown, write "TBD".\n\n## Scheduled Follow-up Meeting\nIMPORTANT: Always propose the next meeting at least ONE FULL DAY AFTER today. Output the proposed Date (DD Month YYYY) and Time (HH:MM, 24h). If a date/time was agreed in the notes, use that — but confirm it is at least a day ahead; otherwise push it forward.\n\n## Deadlines & Dates\nBullet list of all dates mentioned (assignments, exams, results).\n\n## Open Questions\nBullet list of unresolved items.\n\nBe concise and precise. Do not invent facts.`,
      `Today's date: ${new Date().toISOString().slice(0, 10)}\n\nMeeting notes:\n\n${data.notes}`,
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
      `You are an academic operations planner for a Technology Learning Institution. Your job is to help staff keep the institution's database current: applicant records, enrolled students, ongoing courses, upcoming tests, and exam results — and keep students informed.\n\nGiven raw tasks, output Markdown with:\n\n## Prioritized Plan\nNumbered list. Each item: **Task** — Priority (P1/P2/P3) — Est. duration — Why it matters for students / records.\n\n## Suggested Schedule (Today)\nTable: Time Block | Task | Focus Level. Fit within the available hours, include short breaks.\n\n## Student Communications\nBullet list of update-messages to push to applicants or students today (upcoming tests, exam results published, course changes). Each bullet: audience + one-line message.\n\n## Database Updates\nBullet list of specific records to create, update, or verify (applicants, course rosters, results).\n\n## Defer / Delegate\nBullet list of tasks to push or hand off, with reason.\n\nBe specific and actionable.`,
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
      `You are a risk and operations analyst for a Technology Learning Institution. Your focus is on issues that could DELAY OR DISRUPT the academic calendar — for example: severe weather, load-shedding / power outages, water shortages, cyberattacks, malware and ransomware affecting campus systems, network outages, public unrest, transport strikes, and public health risks.\n\nProduce a structured Markdown briefing on the given topic, framed around academic-calendar impact. Sections (in order):\n\n## TL;DR\n3 bullet points — bottom line for the institution today.\n\n## Background\nShort context paragraph on the threat or condition.\n\n## Academic Calendar Impact\n5-7 bullets: which classes, tests, exams, labs, or admin processes could be affected, and how.\n\n## Mitigation & Contingency\nTwo subsections: **Immediate actions** and **Backup plans** (e.g. online fallback, reschedule windows, generator/UPS, backup connectivity, data backups).\n\n## Student & Staff Communications\nDraft 2-3 short notice messages the institution can send out.\n\n## Recommended Next Steps\nNumbered list of concrete actions for the operations team.\n\nDepth requested: ${data.depth}. Be balanced and avoid speculation. If something is uncertain, say so.`,
      `Research topic: ${data.topic}`,
    ),
  );
