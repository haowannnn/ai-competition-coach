"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleContext";
import { AccuracyRadar, TagAccuracyBar } from "@/components/Charts";
import { DifficultyBadge, DomainBadge } from "@/components/badges";
import type { ConceptDomain, Difficulty } from "@/lib/types";

interface Rec {
  questionId: string;
  title: string;
  difficulty: Difficulty;
  domain: ConceptDomain;
  weakestLabel: string | null;
  weakestAccuracy: number | null;
  isFresh: boolean;
}

interface StatsResponse {
  totalSubmissions: number;
  overallAccuracy: number;
  domains: { domain: ConceptDomain; label: string; total: number; correct: number; accuracy: number }[];
  tags: { tagId: string; label: string; total: number; correct: number; accuracy: number }[];
  errorPatterns: { tagId: string; label: string; wrong: number; habitual: number }[];
  recommendations: Rec[];
}

export default function DashboardPage() {
  const { locale, t, ready } = useLocale();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    fetch(`/api/stats?locale=${locale}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [locale, ready]);

  if (!ready || (loading && !stats)) return <Skeleton />;

  const empty = !stats || stats.totalSubmissions === 0;
  const habitualTotal = stats ? stats.errorPatterns.reduce((a, p) => a + p.habitual, 0) : 0;
  const weakCount = stats ? stats.tags.filter((tg) => tg.accuracy < 80).length : 0;

  function recReason(r: Rec): string {
    if (r.isFresh) return t("rec.reason.fresh");
    if (r.weakestLabel != null && r.weakestAccuracy != null) {
      return locale === "en"
        ? `${t("rec.reason.weak")}: ${r.weakestLabel} (${r.weakestAccuracy}% ${t("rec.reason.accuracy")})`
        : `${t("rec.reason.weak")}「${r.weakestLabel}」（${t("rec.reason.accuracy")} ${r.weakestAccuracy}%）`;
    }
    return t("rec.reason.consolidate");
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{t("app.tagline")}</p>
          <h1 className="text-display font-semibold">{t("dash.title")}</h1>
          <p className="mt-2 text-sm text-ink-faint">{t("dash.subtitle")}</p>
        </div>
        <Link href="/practice" className="btn-primary">
          {t("dash.upload")}
        </Link>
      </div>

      {empty ? (
        <EmptyState />
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-ink-line bg-ink-line md:grid-cols-4">
            <Kpi label={t("dash.kpi.graded")} value={`${stats!.totalSubmissions}`} unit={t("unit.problems")} />
            <Kpi label={t("dash.kpi.accuracy")} value={`${stats!.overallAccuracy}`} unit="%" accent />
            <Kpi label={t("dash.kpi.habitual")} value={`${habitualTotal}`} unit={t("unit.times")} />
            <Kpi label={t("dash.kpi.weak")} value={`${weakCount}`} unit={t("unit.count")} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card p-6">
              <h2 className="text-[15px] font-semibold">{t("dash.radar.title")}</h2>
              <p className="mb-4 mt-1 text-xs text-ink-faint">{t("dash.radar.sub")}</p>
              <AccuracyRadar
                data={stats!.domains.map((d) => ({ label: d.label, accuracy: d.accuracy, total: d.total }))}
              />
            </section>

            <section className="card p-6">
              <h2 className="text-[15px] font-semibold">{t("dash.bars.title")}</h2>
              <p className="mb-4 mt-1 text-xs text-ink-faint">{t("dash.bars.sub")}</p>
              {stats!.tags.length > 0 ? (
                <TagAccuracyBar
                  data={stats!.tags.map((tg) => ({ label: tg.label, accuracy: tg.accuracy, total: tg.total }))}
                />
              ) : (
                <p className="py-10 text-center text-sm text-ink-faint">—</p>
              )}
            </section>
          </div>

          {/* Error patterns */}
          <section className="card p-6">
            <h2 className="text-[15px] font-semibold">{t("dash.errors.title")}</h2>
            <p className="mb-5 mt-1 text-xs text-ink-faint">{t("dash.errors.sub")}</p>
            {stats!.errorPatterns.length > 0 ? (
              <ul className="divide-y divide-ink-line">
                {stats!.errorPatterns.map((p) => (
                  <li key={p.tagId} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-bad/10 text-sm font-semibold text-bad">
                        {p.wrong}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{p.label}</p>
                        <p className="text-xs text-ink-faint">
                          {p.wrong} {t("dash.errors.wrongN")}
                          {p.habitual > 0 && ` · ${p.habitual} ${t("dash.errors.habitualN")}`}
                        </p>
                      </div>
                    </div>
                    {p.habitual > 0 && (
                      <span className="pill border-transparent bg-warn/10 text-warn">
                        {t("dash.errors.repeat")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-ink-faint">{t("dash.errors.none")}</p>
            )}
          </section>

          {/* Recommendations */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">{t("dash.rec.title")}</h2>
                <p className="mt-1 text-xs text-ink-faint">{t("dash.rec.sub")}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {stats!.recommendations.map((r) => (
                <Link
                  key={r.questionId}
                  href={`/practice?questionId=${r.questionId}`}
                  className="group card flex flex-col justify-between p-5 transition-all hover:shadow-lift"
                >
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <DomainBadge domain={r.domain} />
                      <DifficultyBadge difficulty={r.difficulty} />
                    </div>
                    <p className="text-[15px] font-medium leading-snug">{r.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{recReason(r)}</p>
                  </div>
                  <span className="mt-4 text-xs font-medium text-accent-600 transition-transform group-hover:translate-x-0.5">
                    {t("dash.rec.go")}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className="bg-paper p-5">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className={`text-3xl font-semibold tracking-tight ${accent ? "text-accent-600" : "text-ink"}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-ink-faint">{unit}</span>}
      </p>
    </div>
  );
}

function EmptyState() {
  const { t } = useLocale();
  return (
    <div className="card flex flex-col items-center gap-5 px-6 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-canvas text-3xl">◔</span>
      <div>
        <h2 className="text-xl font-semibold">{t("dash.empty.title")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-faint">
          {t("dash.empty.body")}
        </p>
      </div>
      <Link href="/practice" className="btn-primary">
        {t("dash.empty.cta")}
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-8">
      <div className="h-12 w-64 animate-pulse rounded-lg bg-ink-line/60" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl2 bg-ink-line/50" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl2 bg-ink-line/50" />
    </div>
  );
}
