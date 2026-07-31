"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleContext";
import { COMPETITIONS, localized, type Competition } from "@/lib/papers";

// How many year-rows to show before "show all".
const PREVIEW_ROWS = 4;

export default function PapersPage() {
  const { locale, t, ready } = useLocale();
  if (!ready) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="eyebrow mb-2">{t("app.tagline")}</p>
        <h1 className="text-display font-semibold">{t("papers.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-faint">{t("papers.subtitle")}</p>
      </div>

      {/* Official archives */}
      <div>
        <h2 className="mb-1 text-[15px] font-semibold">{t("papers.official")}</h2>
        <p className="mb-5 text-xs text-ink-faint">{t("papers.official.note")}</p>
        <div className="space-y-5">
          {COMPETITIONS.map((c) => (
            <CompetitionCard key={c.id} comp={c} locale={locale} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompetitionCard({
  comp,
  locale,
  t,
}: {
  comp: Competition;
  locale: "zh" | "en";
  t: (k: any) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? comp.papers : comp.papers.slice(0, PREVIEW_ROWS);
  const hasMore = comp.papers.length > PREVIEW_ROWS;

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-line p-6">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{localized(comp.name, locale)}</h3>
            <span className="pill">{localized(comp.level, locale)}</span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-ink-faint">{localized(comp.org, locale)}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{localized(comp.blurb, locale)}</p>
        </div>
        <a
          href={comp.officialUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="pill shrink-0 hover:border-ink-soft hover:text-ink"
        >
          {t("papers.viewOnOfficial")} ↗
        </a>
      </div>

      <ul className="divide-y divide-ink-line">
        {rows.map((p) => (
          <li
            key={p.year}
            className="flex items-center justify-between gap-4 px-6 py-3.5"
          >
            <span className="text-sm font-medium tabular-nums">{p.year}</span>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <a
                href={p.problemsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="pill border-accent-600/30 text-accent-600 hover:bg-accent-600/10"
              >
                {t("papers.problems")} ↓
              </a>
              {p.solutionsUrl && (
                <a
                  href={p.solutionsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="pill hover:border-ink-soft hover:text-ink"
                >
                  {t("papers.solutions")} ↓
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full border-t border-ink-line py-3 text-xs font-medium text-ink-faint transition-colors hover:bg-paper hover:text-ink"
        >
          {expanded ? "▲" : `${t("papers.allYears")} (${comp.papers.length}) ▾`}
        </button>
      )}
    </section>
  );
}
