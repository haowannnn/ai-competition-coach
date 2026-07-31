"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleContext";
import { ErrorTypeBadge, TagBadge } from "@/components/badges";
import { questionTitle } from "@/lib/i18n";
import type { Submission, Question } from "@/lib/types";

export default function MistakesPage() {
  const { locale, t, ready } = useLocale();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);

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

  const wrong = submissions.filter((s) => !s.aiResult.is_correct);

  if (!ready) return <div className="h-40 animate-pulse rounded-xl2 bg-ink-line/50" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display font-semibold">{t("mistakes.title")}</h1>
        <p className="mt-2 text-sm text-ink-faint">
          {t("mistakes.subtitle")}
          {wrong.length}
          {t("mistakes.subtitle2")}
        </p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl2 bg-ink-line/50" />
      ) : wrong.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-canvas text-3xl">✓</span>
          <h2 className="text-xl font-semibold">{t("mistakes.empty.title")}</h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-faint">{t("mistakes.empty.body")}</p>
          <Link href="/practice" className="btn-primary">
            {t("mistakes.empty.cta")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {wrong.map((s) => {
            const q = questions[s.questionId];
            return (
              <Link
                key={s.id}
                href={`/result/${s.id}`}
                className="card block p-5 transition-all hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold">
                        {q ? questionTitle(q, locale) : "—"}
                      </h3>
                      <ErrorTypeBadge type={s.aiResult.error_type} />
                    </div>
                    <p className="line-clamp-2 text-sm text-ink-faint">
                      {s.aiResult.error_step ?? s.aiResult.recognized_content}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {s.aiResult.concept_tags.map((tag) => (
                        <TagBadge key={tag} tagId={tag} />
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-ink-faint">
                    {new Date(s.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "zh-CN")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
