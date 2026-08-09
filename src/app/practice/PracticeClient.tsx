"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleContext";
import { DifficultyBadge, DomainBadge, TagBadge } from "@/components/badges";
import { questionContent } from "@/lib/i18n";
import { tagLabel } from "@/lib/concepts";
import { CATEGORY_META } from "@/lib/seed";
import { weightedPick } from "@/lib/review";
import type { MistakeEntry, WeakTag } from "@/lib/review";
import type { Question, Category } from "@/lib/types";

type Mode = "recommend" | "review" | "free";

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PracticeClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { locale, t } = useLocale();

  // Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [entries, setEntries] = useState<MistakeEntry[]>([]);
  const [weakTags, setWeakTags] = useState<WeakTag[]>([]);
  const [dueIds, setDueIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Selection state
  const [mode, setMode] = useState<Mode>("recommend");
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null); // from ?tag= deeplink
  const [selected, setSelected] = useState<Question | null>(null);
  const [hintsVisible, setHintsVisible] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUpload = useCallback(() => {
    setHintsVisible(false);
    setFile(null);
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return null;
    });
    setError(null);
  }, []);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const pickRecommend = useCallback(
    (qs: Question[], wt: WeakTag[], es: MistakeEntry[], excludeId?: string) => {
      const q = weightedPick(qs, wt, es, { excludeId });
      setSelected(q);
      resetUpload();
    },
    [resetUpload]
  );

  const pickReview = useCallback(
    (qs: Question[], due: string[], excludeId?: string) => {
      let pool = qs.filter((q) => due.includes(q.id));
      if (excludeId && pool.length > 1) pool = pool.filter((q) => q.id !== excludeId);
      setSelected(pickRandom(pool));
      resetUpload();
    },
    [resetUpload]
  );

  const pickCategory = useCallback(
    (qs: Question[], cat: Category, excludeId?: string) => {
      let pool = qs.filter((q) => q.category === cat);
      if (excludeId && pool.length > 1) pool = pool.filter((q) => q.id !== excludeId);
      setSelected(pickRandom(pool));
      resetUpload();
    },
    [resetUpload]
  );

  const pickByTag = useCallback(
    (qs: Question[], tag: string, excludeId?: string) => {
      let pool = qs.filter((q) => q.conceptTags.includes(tag));
      if (excludeId && pool.length > 1) pool = pool.filter((q) => q.id !== excludeId);
      setSelected(pickRandom(pool));
      resetUpload();
    },
    [resetUpload]
  );

  // ── Initial load: questions + review data, then honor deeplinks ────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/questions").then((r) => r.json()),
      fetch("/api/review").then((r) => r.json()),
    ]).then(([qData, rData]) => {
      const qs: Question[] = qData.questions ?? [];
      const es: MistakeEntry[] = rData.entries ?? [];
      const wt: WeakTag[] = rData.weakTags ?? [];
      const due: string[] = rData.dueIds ?? [];
      setQuestions(qs);
      setEntries(es);
      setWeakTags(wt);
      setDueIds(due);
      setLoaded(true);

      // Deeplinks from dashboard / mistakes / result pages.
      const qid = params.get("questionId");
      const tag = params.get("tag");
      const wantMode = params.get("mode");
      if (qid) {
        const q = qs.find((x) => x.id === qid);
        if (q) {
          setMode("recommend");
          setSelected(q);
          return;
        }
      }
      if (tag) {
        setMode("recommend");
        setTagFilter(tag);
        pickByTag(qs, tag);
        return;
      }
      if (wantMode === "review" && due.length > 0) {
        setMode("review");
        pickReview(qs, due);
        return;
      }
      // Default: recommend mode picks a weakness-aware question.
      pickRecommend(qs, wt, es);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mode switching ─────────────────────────────────────────────────────────
  const switchMode = (m: Mode) => {
    setMode(m);
    setTagFilter(null);
    if (m === "recommend") {
      pickRecommend(questions, weakTags, entries);
    } else if (m === "review") {
      pickReview(questions, dueIds);
    } else {
      // free: wait for a category click
      setSelectedCat(null);
      setSelected(null);
      resetUpload();
    }
  };

  // "New question" — re-roll within the active mode.
  const handleRoll = () => {
    const excludeId = selected?.id;
    if (tagFilter) return pickByTag(questions, tagFilter, excludeId);
    if (mode === "recommend") return pickRecommend(questions, weakTags, entries, excludeId);
    if (mode === "review") return pickReview(questions, dueIds, excludeId);
    if (mode === "free" && selectedCat) return pickCategory(questions, selectedCat, excludeId);
  };

  const handleCategoryClick = (cat: Category) => {
    setSelectedCat(cat);
    setTagFilter(null);
    pickCategory(questions, cat);
  };

  // ── File helpers ───────────────────────────────────────────────────────────
  const onPickFile = (f: File | null) => {
    setFile(f);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmit = async () => {
    if (!selected) return setError(t("practice.err.question"));
    if (!file) return setError(t("practice.err.image"));

    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("questionId", selected.id);
      fd.append("image", file);
      fd.append("locale", locale);
      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      router.push(`/result/${data.submission.id}`);
    } catch {
      setError(t("practice.err.failed"));
      setSubmitting(false);
    }
  };

  const catEntries = Object.entries(CATEGORY_META) as [
    Category,
    (typeof CATEGORY_META)[Category],
  ][];

  const dueCount = dueIds.length;
  const showCategoryList = mode === "free" && !tagFilter;

  // Contextual subheading describing why this question was chosen.
  const contextLine = (() => {
    if (tagFilter) return `${t("practice.similarOf")}「${tagLabel(tagFilter, locale)}」`;
    if (mode === "recommend") return t("practice.mode.recommend.hint");
    if (mode === "review") return t("practice.mode.review.hint");
    return null;
  })();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display font-semibold tracking-tight">{t("practice.title")}</h1>
        <p className="mt-2 text-sm text-ink-faint">{t("practice.subtitle")}</p>
      </header>

      {/* Mode switcher */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-ink-line bg-paper p-1 text-sm">
        <ModeTab active={mode === "recommend" && !tagFilter} onClick={() => switchMode("recommend")}>
          {t("practice.mode.recommend")}
        </ModeTab>
        <ModeTab
          active={mode === "review"}
          onClick={() => dueCount > 0 && switchMode("review")}
          disabled={dueCount === 0}
        >
          {t("practice.mode.review")}
          {dueCount > 0 && (
            <span className="ml-1.5 rounded-full bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold text-paper">
              {dueCount}
            </span>
          )}
        </ModeTab>
        <ModeTab active={mode === "free"} onClick={() => switchMode("free")}>
          {t("practice.mode.free")}
        </ModeTab>
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* Left: category list — only in free mode */}
        {showCategoryList ? (
          <aside className="md:border-r md:border-ink-line md:pr-6">
            <p className="eyebrow mb-3">{t("practice.category")}</p>
            <nav className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
              {catEntries.map(([cat, meta]) => {
                const active = selectedCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={[
                      "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                      active ? "bg-ink text-paper" : "text-ink-faint hover:bg-canvas hover:text-ink",
                    ].join(" ")}
                  >
                    {locale === "zh" ? meta.label : meta.labelEn}
                  </button>
                );
              })}
            </nav>
          </aside>
        ) : (
          <aside className="hidden md:block md:border-r md:border-ink-line md:pr-6">
            <p className="eyebrow mb-3">{t("practice.context")}</p>
            <p className="text-sm leading-relaxed text-ink-faint">{contextLine}</p>
            {tagFilter && (
              <button
                onClick={() => switchMode("recommend")}
                className="mt-4 text-xs font-medium text-accent-600 hover:underline"
              >
                {t("practice.clearFilter")}
              </button>
            )}
          </aside>
        )}

        {/* Right: workspace */}
        <div className="min-w-0">
          {!loaded ? (
            <div className="h-80 animate-pulse rounded-2xl bg-ink-line/50" />
          ) : mode === "free" && !selectedCat ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-ink-line">
              <p className="text-sm text-ink-faint">{t("practice.pickPrompt")}</p>
            </div>
          ) : !selected ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-line text-center">
              <p className="text-sm text-ink-faint">
                {mode === "review" ? t("practice.review.empty") : t("practice.noQs")}
              </p>
              {mode === "review" && (
                <button
                  onClick={() => switchMode("recommend")}
                  className="text-xs font-medium text-accent-600 hover:underline"
                >
                  {t("practice.mode.recommend")} →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Question block */}
              <section>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold leading-snug">
                    {locale === "zh" ? selected.title : (selected.titleEn ?? selected.title)}
                  </h2>
                  <button
                    onClick={handleRoll}
                    className="shrink-0 text-xs font-medium text-ink-faint transition-colors hover:text-ink"
                  >
                    {t("practice.roll")}
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <DomainBadge domain={selected.domain} />
                  <DifficultyBadge difficulty={selected.difficulty} />
                </div>

                <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
                  {questionContent(selected, locale)}
                </p>

                {selected.conceptTags.length > 0 && (
                  <div className="mt-5">
                    <button
                      onClick={() => setHintsVisible((v) => !v)}
                      className="text-xs font-medium text-accent-600 hover:underline"
                    >
                      {hintsVisible ? t("practice.hint.hide") : t("practice.hint.show")}
                    </button>
                    {hintsVisible && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.conceptTags.map((tag) => (
                          <TagBadge key={tag} tagId={tag} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Divider */}
              <hr className="border-ink-line" />

              {/* Upload block */}
              <section>
                <label className="eyebrow mb-3 block">{t("practice.uploadLabel")}</label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-line px-6 py-12 text-center transition-colors hover:border-ink-faint hover:bg-canvas/50"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="preview"
                      className="max-h-72 rounded-lg border border-ink-line object-contain"
                    />
                  ) : (
                    <>
                      <p className="text-sm font-medium text-ink-soft">{t("practice.dropTitle")}</p>
                      <p className="text-xs text-ink-faint">{t("practice.dropHint")}</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />

                {file && (
                  <p className="mt-3 truncate text-xs text-ink-faint">
                    {t("practice.selected")}: {file.name}
                    <button
                      onClick={() => onPickFile(null)}
                      className="ml-2 text-accent-600 hover:underline"
                    >
                      {t("practice.remove")}
                    </button>
                  </p>
                )}

                {error && (
                  <p className="mt-3 rounded-lg bg-bad/[0.06] px-3 py-2 text-sm text-bad">{error}</p>
                )}

                <button
                  onClick={onSubmit}
                  disabled={submitting || !selected}
                  className="btn-primary mt-6 w-full sm:w-auto sm:px-10"
                >
                  {submitting ? t("practice.submitting") : t("practice.submit")}
                </button>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center rounded-lg px-3.5 py-1.5 font-medium transition-colors",
        active
          ? "bg-ink text-paper"
          : disabled
            ? "cursor-not-allowed text-ink-line"
            : "text-ink-faint hover:bg-canvas hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
