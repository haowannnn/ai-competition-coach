"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleContext";
import ResultCard from "@/components/ResultCard";
import { DifficultyBadge, DomainBadge } from "@/components/badges";
import { questionTitle, questionContent, questionAnswer } from "@/lib/i18n";
import type { Submission, Question } from "@/lib/types";

export default function ResultClient({ id }: { id: string }) {
  const { locale, t } = useLocale();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setSubmission(data.submission);
        setQuestion(data.question);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="card px-6 py-20 text-center text-sm text-ink-faint">{t("result.notfound")}</div>
    );
  }
  if (!submission) {
    return <div className="h-96 animate-pulse rounded-xl2 bg-ink-line/50" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/practice" className="text-sm text-ink-faint transition-colors hover:text-ink-soft">
          {t("result.back")}
        </Link>
        <Link href="/" className="text-sm font-medium text-accent-600 hover:underline">
          {t("result.toDash")}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: the question + uploaded image */}
        <div className="space-y-6">
          {question && (
            <section className="card p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <DomainBadge domain={question.domain} />
                <DifficultyBadge difficulty={question.difficulty} />
              </div>
              <h1 className="mb-2.5 text-xl font-semibold">{questionTitle(question, locale)}</h1>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
                {questionContent(question, locale)}
              </p>
            </section>
          )}

          <section className="card p-6">
            <h2 className="eyebrow mb-3">{t("result.yourUpload")}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={submission.imagePath}
              alt="solution"
              className="w-full rounded-lg border border-ink-line object-contain"
            />
          </section>
        </div>

        {/* Right: AI result */}
        <div className="space-y-4">
          <ResultCard result={submission.aiResult} />

          {question && (
            <details className="card p-6">
              <summary className="cursor-pointer text-sm font-medium text-ink-soft">
                {t("result.showAnswer")}
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {questionAnswer(question, locale)}
              </p>
            </details>
          )}

          <Link href="/practice" className="btn-ghost w-full">
            {t("result.again")}
          </Link>
        </div>
      </div>
    </div>
  );
}
