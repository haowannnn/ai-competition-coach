"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleContext";
import { TagBadge } from "@/components/badges";
import { questionTitle } from "@/lib/i18n";
import { buildMistakeEntries, dueEntries } from "@/lib/review";
import type { MistakeStatus } from "@/lib/review";
import type { Submission, Question } from "@/lib/types";

type Filter = "all" | MistakeStatus;

const STATUS_STYLE: Record<MistakeStatus, string> = {
  unresolved: "bg-bad/10 text-bad",
  reviewing: "bg-warn/10 text-warn",
  mastered: "bg-good/10 text-good",
};

export default function MistakesPage() {
  const { locale, t, ready } = useLocale();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/submissions`).then((r) => r.json()),
      fetch(`/api/questions`).then((r) => r.json()),
    ])
      .then(([subData, qData]) => {
        setSubmissions(subData.submissions ?? []);
        const map: Record<string, Question> = {};
        for (const q of qData.questions ?? []) map[q.id] = q;
        setQuestions(map);
      })
      .finally(() => setLoading(false));
  }, [ready]);

  // Mastery entries are pure functions of submission history.
  const questionList = useMemo(() => Object.values(questions), [questions]);
  const entries = useMemo(
    () => buildMistakeEntries(submissions, questionList),
    [submissions, questionList]
  );
  const dueIds = useMemo(
    () => new Set(dueEntries(entries).map((e) => e.questionId)),
    [entries]
  );

  // Latest submission per question, for the "view grading" deeplink.
  const latestSubId = useMemo(() => {
    const map: Record<string, { id: string; at: number }> = {};
    for (const s of submissions) {
      const at = new Date(s.createdAt).getTime();
      const cur = map[s.questionId];
      if (!cur || at > cur.at) map[s.questionId] = { id: s.id, at };
    }
    return map;
  }, [submissions]);

  const counts = useMemo(() => {
    const c = { all: entries.length, unresolved: 0, reviewing: 0, mastered: 0 };
    for (const e of entries) c[e.status]++;
    return c;
  }, [entries]);

  const shown = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  if (!ready) return <div className="h-40 animate-pulse rounded-xl2 bg-ink-line/50" />;

  const filters: Filter[] = ["all", "unresolved", "reviewing", "mastered"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display font-semibold">{t("mistakes.title")}</h1>
        <p className="mt-2 text-sm text-ink-faint">
          {t("mistakes.subtitle")}
          {entries.length}
          {t("mistakes.subtitle2")}
        </p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl2 bg-ink-line/50" />
      ) : entries.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
          <h2 className="text-xl font-semibold">{t("mistakes.empty.title")}</h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-faint">{t("mistakes.empty.body")}</p>
          <Link href="/practice" className="btn-primary">
            {t("mistakes.empty.cta")}
          </Link>
        </div>
      ) : (
        <>
          {/* Status filter */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-ink-line bg-paper p-1 text-sm">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "rounded-lg px-3 py-1.5 font-medium transition-colors",
                  filter === f
                    ? "bg-ink text-paper"
                    : "text-ink-faint hover:bg-canvas hover:text-ink",
                ].join(" ")}
              >
                {t(`mistakes.filter.${f}` as never)}
                <span className="ml-1.5 text-xs opacity-70">{counts[f]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {shown.map((e) => {
              const q = questions[e.questionId];
              const subId = latestSubId[e.questionId]?.id;
              const isDue = dueIds.has(e.questionId);
              const tags = e.conceptTags.length
                ? e.conceptTags
                : (q?.conceptTags ?? []);
              const similarTag = tags[0];
              return (
                <div key={e.questionId} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[15px] font-semibold">
                          {q ? questionTitle(q, locale) : "—"}
                        </h3>
                        <span
                          className={`pill border-transparent ${STATUS_STYLE[e.status]}`}
                        >
                          {t(`mistakes.status.${e.status}` as never)}
                        </span>
                        {isDue && (
                          <span className="pill border-transparent bg-accent-600/10 text-accent-600">
                            {t("mistakes.due")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-faint">
                        {t("mistakes.attempts")}
                        {": "}
                        {e.attempts} · {t("mistakes.wrong")}
                        {": "}
                        {e.wrongAttempts}
                      </p>
                      {tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <TagBadge key={tag} tagId={tag} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 text-xs">
                      {similarTag && (
                        <Link
                          href={`/practice?tag=${similarTag}`}
                          className="font-medium text-accent-600 hover:underline"
                        >
                          {t("mistakes.similar")}
                        </Link>
                      )}
                      {subId && (
                        <Link
                          href={`/result/${subId}`}
                          className="text-ink-faint transition-colors hover:text-ink"
                        >
                          {t("mistakes.viewGrading")}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
