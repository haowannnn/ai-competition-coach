import { NextRequest, NextResponse } from "next/server";
import { getSubmission, getQuestion } from "@/lib/db";
import { tutorReply, type TutorMessage } from "@/lib/anthropic";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/tutor — Socratic follow-up conversation for a graded submission.
// Body: { submissionId: string, locale?: "zh"|"en", messages: TutorMessage[] }
// The full chat history is sent each turn (the tutor state is derived, not stored).
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const submissionId = typeof body?.submissionId === "string" ? body.submissionId : "";
  const locale: Locale = body?.locale === "en" ? "en" : "zh";

  // Sanitize the incoming history: only user/assistant roles, string content.
  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const history: TutorMessage[] = rawMessages
    .filter(
      (m: any) =>
        (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
    )
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-20); // cap context

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
  }
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "messages must end with a user turn" },
      { status: 400 }
    );
  }

  const submission = await getSubmission(submissionId);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  const question = getQuestion(submission.questionId);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const { reply, source } = await tutorReply(question, submission.aiResult, history, locale);
  return NextResponse.json({ reply, source });
}
