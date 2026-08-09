import type { Submission, Question } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Review engine — the "closed loop".
//
// Design principle: submissions are the ONLY persisted entity. Everything here
// (mistake state, mastery, spaced-repetition due dates, weighted practice) is a
// PURE FUNCTION of the submission history. Replaying a learner's attempts in
// chronological order reconstructs a per-question review state. Nothing new is
// written to the store, so this composes cleanly with the existing architecture.
// ─────────────────────────────────────────────────────────────────────────────

export type MistakeStatus = "unresolved" | "reviewing" | "mastered";

export interface MistakeEntry {
  questionId: string;
  conceptTags: string[]; // union of AI-attributed tags across wrong attempts
  status: MistakeStatus;
  attempts: number; // total attempts on this question
  wrongAttempts: number;
  firstWrongAt: string; // ISO
  lastAttemptAt: string; // ISO
  lastCorrect: boolean;
  streak: number; // consecutive correct attempts at the tail
  dueAt: string; // ISO — when this should resurface for review
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Simplified SM-2 interval ladder (in days). Each consecutive correct answer
// promotes to the next interval; a wrong answer resets to the first rung.
const INTERVALS = [1, 3, 7, 16, 35];

function intervalForStreak(streak: number): number {
  if (streak <= 0) return 0; // due immediately
  return INTERVALS[Math.min(streak, INTERVALS.length) - 1];
}

// A question is "mastered" once the learner has a tail streak of >= this many
// correct attempts after having gotten it wrong at least once.
const MASTERY_STREAK = 2;

// ─────────────────────────────────────────────────────────────────────────────
// Build per-question review entries by replaying submissions oldest → newest.
// Only questions the learner got wrong at least once become MistakeEntries.
// ─────────────────────────────────────────────────────────────────────────────
export function buildMistakeEntries(
  submissions: Submission[],
  questions: Question[]
): MistakeEntry[] {
  const qById = new Map(questions.map((q) => [q.id, q]));

  // Oldest first so streaks accumulate in real order.
  const ordered = [...submissions].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
  );

  interface Acc {
    questionId: string;
    tags: Set<string>;
    attempts: number;
    wrongAttempts: number;
    firstWrongAt: string | null;
    lastAttemptAt: string;
    lastCorrect: boolean;
    streak: number;
    everWrong: boolean;
  }

  const acc = new Map<string, Acc>();

  for (const s of ordered) {
    if (!qById.has(s.questionId)) continue;
    let a = acc.get(s.questionId);
    if (!a) {
      a = {
        questionId: s.questionId,
        tags: new Set(),
        attempts: 0,
        wrongAttempts: 0,
        firstWrongAt: null,
        lastAttemptAt: s.createdAt,
        lastCorrect: false,
        streak: 0,
        everWrong: false,
      };
      acc.set(s.questionId, a);
    }
    a.attempts += 1;
    a.lastAttemptAt = s.createdAt;
    const correct = s.aiResult.is_correct;
    a.lastCorrect = correct;
    if (correct) {
      a.streak += 1;
    } else {
      a.streak = 0;
      a.wrongAttempts += 1;
      a.everWrong = true;
      if (!a.firstWrongAt) a.firstWrongAt = s.createdAt;
      for (const tag of s.aiResult.concept_tags) a.tags.add(tag);
    }
  }

  const entries: MistakeEntry[] = [];
  for (const a of acc.values()) {
    if (!a.everWrong) continue; // never wrong → not a mistake

    let status: MistakeStatus;
    if (a.lastCorrect && a.streak >= MASTERY_STREAK) status = "mastered";
    else if (a.lastCorrect) status = "reviewing";
    else status = "unresolved";

    const lastMs = new Date(a.lastAttemptAt).getTime();
    const dueMs = lastMs + intervalForStreak(a.streak) * DAY_MS;

    entries.push({
      questionId: a.questionId,
      conceptTags: [...a.tags],
      status,
      attempts: a.attempts,
      wrongAttempts: a.wrongAttempts,
      firstWrongAt: a.firstWrongAt ?? a.lastAttemptAt,
      lastAttemptAt: a.lastAttemptAt,
      lastCorrect: a.lastCorrect,
      streak: a.streak,
      dueAt: new Date(dueMs).toISOString(),
    });
  }

  // Unresolved first, then reviewing, then mastered; within a group, most
  // recently attempted first.
  const rank: Record<MistakeStatus, number> = { unresolved: 0, reviewing: 1, mastered: 2 };
  entries.sort((x, y) => {
    if (rank[x.status] !== rank[y.status]) return rank[x.status] - rank[y.status];
    return x.lastAttemptAt < y.lastAttemptAt ? 1 : -1;
  });
  return entries;
}

// Questions whose review is due now (dueAt <= now) and not yet mastered.
export function dueEntries(entries: MistakeEntry[], now: Date = new Date()): MistakeEntry[] {
  const t = now.getTime();
  return entries.filter(
    (e) => e.status !== "mastered" && new Date(e.dueAt).getTime() <= t
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Weighted practice selection.
//
// Given the learner's weak concept tags (lowest accuracy first) and their
// mistake entries, score every question so that:
//   • questions touching weak tags weigh more (more overlap = higher weight)
//   • due review questions get a strong boost
//   • already-mastered questions are de-emphasized
//   • unattempted questions keep a small baseline so practice stays fresh
// Then draw ONE question via weighted random — targeted, but not deterministic.
// ─────────────────────────────────────────────────────────────────────────────

export interface WeakTag {
  tagId: string;
  accuracy: number; // 0-100
}

interface Scored {
  q: Question;
  weight: number;
  reasonTagId: string | null;
}

function scoreQuestions(
  questions: Question[],
  weakTags: WeakTag[],
  entries: MistakeEntry[],
  now: Date
): Scored[] {
  const weakById = new Map(weakTags.map((w) => [w.tagId, w.accuracy]));
  const entryByQ = new Map(entries.map((e) => [e.questionId, e]));
  const dueSet = new Set(dueEntries(entries, now).map((e) => e.questionId));

  return questions.map((q) => {
    let weight = 1; // baseline so every question is reachable
    let reasonTagId: string | null = null;
    let bestAcc = 101;

    // Weak-tag overlap: lower accuracy → larger boost.
    for (const tag of q.conceptTags) {
      const acc = weakById.get(tag);
      if (acc == null) continue;
      weight += (100 - acc) / 10; // e.g. 40% acc → +6
      if (acc < bestAcc) {
        bestAcc = acc;
        reasonTagId = tag;
      }
    }

    const entry = entryByQ.get(q.id);
    if (entry) {
      if (dueSet.has(q.id)) weight += 8; // due for review — strong pull
      if (entry.status === "unresolved") weight += 4;
      if (entry.status === "mastered") weight *= 0.15; // rarely resurface
    }

    return { q, weight, reasonTagId };
  });
}

// Draw one question by weighted random from a pool, optionally excluding an id
// (so "New question" never repeats the current one when alternatives exist).
export function weightedPick(
  questions: Question[],
  weakTags: WeakTag[],
  entries: MistakeEntry[],
  opts: { excludeId?: string; now?: Date } = {}
): Question | null {
  const now = opts.now ?? new Date();
  let pool = questions;
  if (opts.excludeId && questions.length > 1) {
    pool = questions.filter((q) => q.id !== opts.excludeId);
  }
  const scored = scoreQuestions(pool, weakTags, entries, now);
  const total = scored.reduce((s, x) => s + x.weight, 0);
  if (total <= 0) return pool.length ? pool[0] : null;

  let r = Math.random() * total;
  for (const x of scored) {
    r -= x.weight;
    if (r <= 0) return x.q;
  }
  return scored[scored.length - 1]?.q ?? null;
}

