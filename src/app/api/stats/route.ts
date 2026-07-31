import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, getQuestions } from "@/lib/db";
import {
  domainStats,
  tagStats,
  errorPatterns,
  recommendQuestions,
  overallAccuracy,
} from "@/lib/stats";
import { questionTitle } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/stats?locale=zh|en -> aggregated dashboard data for the user.
export async function GET(req: NextRequest) {
  const locale: Locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "zh";

  const questions = getQuestions();
  const submissions = await getSubmissions();

  return NextResponse.json({
    totalSubmissions: submissions.length,
    overallAccuracy: overallAccuracy(submissions),
    domains: domainStats(submissions, questions, locale),
    tags: tagStats(submissions, questions, locale),
    errorPatterns: errorPatterns(submissions, locale),
    recommendations: recommendQuestions(submissions, questions, locale, 3).map((r) => ({
      questionId: r.question.id,
      title: questionTitle(r.question, locale),
      difficulty: r.question.difficulty,
      domain: r.question.domain,
      weakestTagId: r.weakestTagId,
      weakestAccuracy: r.weakestAccuracy,
      weakestLabel: r.weakestTagId
        ? tagStats(submissions, questions, locale).find((t) => t.tagId === r.weakestTagId)?.label ?? null
        : null,
      isFresh: r.isFresh,
    })),
  });
}
