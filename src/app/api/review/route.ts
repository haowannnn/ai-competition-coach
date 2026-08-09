import { NextResponse } from "next/server";
import { getSubmissions, getQuestions } from "@/lib/db";
import { tagStats } from "@/lib/stats";
import { buildMistakeEntries, dueEntries } from "@/lib/review";

export const dynamic = "force-dynamic";

// GET /api/review -> everything the practice page needs to do targeted,
// history-aware question selection on the client:
//   • entries   — per-question mistake/mastery state (from submission replay)
//   • weakTags  — concept tags with accuracy, lowest first
//   • dueIds    — questions due for spaced review right now
// The client imports weightedPick() from lib/review and combines these with
// the full question bank. No server-only deps leak, so this stays a pure read.
export async function GET() {
  const questions = getQuestions();
  const submissions = await getSubmissions();

  const entries = buildMistakeEntries(submissions, questions);
  const due = dueEntries(entries);

  // tagStats is locale-tagged for labels, but here we only need ids + accuracy.
  const weakTags = tagStats(submissions, questions, "zh")
    .filter((tg) => tg.accuracy < 100)
    .map((tg) => ({ tagId: tg.tagId, accuracy: tg.accuracy }));

  return NextResponse.json({
    entries,
    weakTags,
    dueIds: due.map((e) => e.questionId),
    dueCount: due.length,
  });
}
