import type { Submission, Question, ConceptDomain, Locale } from "./types";
import { CONCEPT_TAGS, domainLabel, tagLabel, tagDomain } from "./concepts";

export interface DomainStat {
  domain: ConceptDomain;
  label: string;
  total: number;
  correct: number;
  accuracy: number; // 0-100
}

export interface ErrorPattern {
  tagId: string;
  label: string;
  domain: ConceptDomain | undefined;
  attempts: number;
  wrong: number;
  habitual: number;
}

export interface TagStat {
  tagId: string;
  label: string;
  domain: ConceptDomain | undefined;
  total: number;
  correct: number;
  accuracy: number;
}

// Per-domain accuracy for the radar chart.
export function domainStats(
  submissions: Submission[],
  questions: Question[],
  locale: Locale
): DomainStat[] {
  const qById = new Map(questions.map((q) => [q.id, q]));
  const domains: ConceptDomain[] = ["number_theory", "combinatorics", "algebra", "geometry"];
  const acc: Record<string, { total: number; correct: number }> = {};
  for (const d of domains) acc[d] = { total: 0, correct: 0 };

  for (const s of submissions) {
    const q = qById.get(s.questionId);
    if (!q) continue;
    acc[q.domain].total += 1;
    if (s.aiResult.is_correct) acc[q.domain].correct += 1;
  }

  return domains.map((d) => {
    const { total, correct } = acc[d];
    return {
      domain: d,
      label: domainLabel(d, locale),
      total,
      correct,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    };
  });
}

// Per concept-tag accuracy (based on the question's tags).
export function tagStats(
  submissions: Submission[],
  questions: Question[],
  locale: Locale
): TagStat[] {
  const qById = new Map(questions.map((q) => [q.id, q]));
  const acc: Record<string, { total: number; correct: number }> = {};

  for (const s of submissions) {
    const q = qById.get(s.questionId);
    if (!q) continue;
    for (const tag of q.conceptTags) {
      if (!acc[tag]) acc[tag] = { total: 0, correct: 0 };
      acc[tag].total += 1;
      if (s.aiResult.is_correct) acc[tag].correct += 1;
    }
  }

  return Object.entries(acc)
    .map(([tagId, { total, correct }]) => ({
      tagId,
      label: tagLabel(tagId, locale),
      domain: tagDomain(tagId),
      total,
      correct,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

// "Most common error patterns" — group wrong submissions by attributed tags.
export function errorPatterns(submissions: Submission[], locale: Locale): ErrorPattern[] {
  const acc: Record<string, { wrong: number; habitual: number }> = {};

  for (const s of submissions) {
    if (s.aiResult.is_correct) continue;
    for (const tag of s.aiResult.concept_tags) {
      if (!acc[tag]) acc[tag] = { wrong: 0, habitual: 0 };
      acc[tag].wrong += 1;
      if (s.aiResult.error_type === "habitual") acc[tag].habitual += 1;
    }
  }

  return Object.entries(acc)
    .map(([tagId, { wrong, habitual }]) => ({
      tagId,
      label: tagLabel(tagId, locale),
      domain: tagDomain(tagId),
      attempts: wrong,
      wrong,
      habitual,
    }))
    .sort((a, b) => b.wrong - a.wrong);
}

// Recommend questions targeting the weakest tags. Returns structured fields so
// the caller can localize the reason.
export interface Recommendation {
  question: Question;
  weakestTagId: string | null;
  weakestAccuracy: number | null;
  isFresh: boolean; // true when there's no weakness data yet
}

export function recommendQuestions(
  submissions: Submission[],
  questions: Question[],
  locale: Locale,
  limit = 3
): Recommendation[] {
  const tags = tagStats(submissions, questions, locale);
  const attemptedIds = new Set(submissions.map((s) => s.questionId));
  const weakTags = tags.filter((t) => t.accuracy < 100).slice(0, 5);

  if (weakTags.length === 0) {
    const pool = questions.filter((q) => !attemptedIds.has(q.id));
    return pool.slice(0, limit).map((q) => ({
      question: q,
      weakestTagId: null,
      weakestAccuracy: null,
      isFresh: true,
    }));
  }

  const weakTagIds = weakTags.map((t) => t.tagId);
  const scored = questions
    .map((q) => {
      const overlap = q.conceptTags.filter((t) => weakTagIds.includes(t));
      const weakestOverlap = overlap
        .map((t) => weakTags.find((w) => w.tagId === t))
        .filter(Boolean)
        .sort((a, b) => a!.accuracy - b!.accuracy)[0];
      return { q, overlapCount: overlap.length, weakest: weakestOverlap };
    })
    .filter((x) => x.overlapCount > 0)
    .sort((a, b) => {
      const aUn = attemptedIds.has(a.q.id) ? 1 : 0;
      const bUn = attemptedIds.has(b.q.id) ? 1 : 0;
      if (aUn !== bUn) return aUn - bUn;
      if (b.overlapCount !== a.overlapCount) return b.overlapCount - a.overlapCount;
      return (a.weakest?.accuracy ?? 0) - (b.weakest?.accuracy ?? 0);
    });

  return scored.slice(0, limit).map((x) => ({
    question: x.q,
    weakestTagId: x.weakest?.tagId ?? null,
    weakestAccuracy: x.weakest?.accuracy ?? null,
    isFresh: false,
  }));
}

export function overallAccuracy(submissions: Submission[]): number {
  if (submissions.length === 0) return 0;
  const correct = submissions.filter((s) => s.aiResult.is_correct).length;
  return Math.round((correct / submissions.length) * 100);
}

// ── Learning trajectory ──────────────────────────────────────────────────────
// Accuracy over time. For each attempt (oldest → newest) we report the
// cumulative accuracy up to that point plus a rolling accuracy over the last
// WINDOW attempts. The rolling line shows recent form (it can rise even when the
// cumulative line is still weighed down by early mistakes) — the "getting
// better" story that sells an education product.
export interface TrajectoryPoint {
  index: number; // 1-based attempt number
  date: string; // YYYY-MM-DD of the attempt
  correct: boolean; // was this single attempt correct
  cumulative: number; // 0-100 cumulative accuracy through this attempt
  rolling: number; // 0-100 accuracy over the last WINDOW attempts
}

const TRAJECTORY_WINDOW = 5;

export function accuracyTrajectory(submissions: Submission[]): TrajectoryPoint[] {
  const ordered = [...submissions].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
  );
  const points: TrajectoryPoint[] = [];
  let correctSoFar = 0;
  for (let i = 0; i < ordered.length; i++) {
    const isCorrect = ordered[i].aiResult.is_correct;
    if (isCorrect) correctSoFar += 1;
    const windowStart = Math.max(0, i - TRAJECTORY_WINDOW + 1);
    const windowSlice = ordered.slice(windowStart, i + 1);
    const windowCorrect = windowSlice.filter((s) => s.aiResult.is_correct).length;
    points.push({
      index: i + 1,
      date: ordered[i].createdAt.slice(0, 10),
      correct: isCorrect,
      cumulative: Math.round((correctSoFar / (i + 1)) * 100),
      rolling: Math.round((windowCorrect / windowSlice.length) * 100),
    });
  }
  return points;
}

export { CONCEPT_TAGS };
