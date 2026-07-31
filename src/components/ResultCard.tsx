"use client";

import type { AiResult } from "@/lib/types";
import { TagBadge, ErrorTypeBadge } from "./badges";
import { useLocale } from "./LocaleContext";

// Renders the structured AI grading result. Used on the result page and
// inside the mistakes book.
export default function ResultCard({ result }: { result: AiResult }) {
  const { t } = useLocale();
  const correct = result.is_correct;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-line px-6 py-5">
        <div className="flex items-center gap-3.5">
          <span
            className={`grid h-11 w-11 place-items-center rounded-full text-lg font-semibold ${
              correct ? "bg-good/12 text-good" : "bg-bad/12 text-bad"
            }`}
          >
            {correct ? "✓" : "✕"}
          </span>
          <div>
            <p className="text-[15px] font-semibold">
              {correct ? t("result.correct") : t("result.wrong")}
            </p>
            <p className="text-xs text-ink-faint">{t("result.badge")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ErrorTypeBadge type={result.error_type} />
          {result._source === "mock" && <span className="pill">{t("result.mock")}</span>}
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <Section title={t("result.sec.recognized")}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
            {result.recognized_content}
          </p>
        </Section>

        {!correct && result.error_step && (
          <Section title={t("result.sec.error")}>
            <p className="rounded-xl border border-bad/15 bg-bad/[0.04] px-4 py-3 text-sm leading-relaxed text-ink">
              {result.error_step}
            </p>
          </Section>
        )}

        {result.concept_tags.length > 0 && (
          <Section title={t("result.sec.concepts")}>
            <div className="flex flex-wrap gap-2">
              {result.concept_tags.map((tag) => (
                <TagBadge key={tag} tagId={tag} />
              ))}
            </div>
          </Section>
        )}

        <Section title={t("result.sec.feedback")}>
          <p className="rounded-xl bg-canvas px-4 py-3.5 text-sm leading-relaxed text-ink-soft">
            {result.feedback}
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-2.5">{title}</h3>
      {children}
    </div>
  );
}
