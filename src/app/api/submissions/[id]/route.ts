import { NextRequest, NextResponse } from "next/server";
import { getSubmission, getQuestion } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/submissions/:id -> one submission with its question.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sub = await getSubmission(params.id);
  if (!sub) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ submission: sub, question: getQuestion(sub.questionId) ?? null });
}
