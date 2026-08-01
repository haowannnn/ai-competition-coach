"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleContext";
import { DifficultyBadge, DomainBadge, TagBadge } from "@/components/badges";
import { questionContent } from "@/lib/i18n";
import { CATEGORY_META } from "@/lib/seed";
import type { Question } from "@/lib/types";
import type { Category } from "@/lib/types";

// Pick a random element from an array
function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PracticeClient() {
  const router = useRouter();
  const { locale, t } = useLocale();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selected, setSelected] = useState<Question | null>(null);
  const [hintsVisible, setHintsVisible] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load questions once; if a category is already selected, auto-roll after load
  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data) => {
        const qs: Question[] = data.questions ?? [];
        setQuestions(qs);
        // If the user already clicked a category while data was loading, pick now
        setSelectedCat((cat) => {
          if (cat) {
            const pool = qs.filter((q) => q.category === cat);
            const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
            setSelected(pick);
          }
          return cat;
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pick a random question from the chosen category
  const rollQuestion = useCallback(
    (cat: Category) => {
      const pool = questions.filter((q) => q.category === cat);
      setSelected(pickRandom(pool));
      setHintsVisible(false);
      setFile(null);
      setPreview(null);
      setError(null);
    },
    [questions]
  );

  const handleCategoryClick = (cat: Category) => {
    setSelectedCat(cat);
    rollQuestion(cat);
  };

  const handleRoll = () => {
    if (selectedCat) rollQuestion(selectedCat);
  };

  // File helpers
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display font-semibold">{t("practice.title")}</h1>
        <p className="mt-2 text-sm text-ink-faint">{t("practice.subtitle")}</p>
      </div>

      {/* Category picker */}
      <section>
        <p className="eyebrow mb-3">{t("practice.category")}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {catEntries.map(([cat, meta]) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={[
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all",
                selectedCat === cat
                  ? "border-accent-600 bg-accent-600/10 text-accent-700 dark:text-accent-400"
                  : "border-ink-line bg-paper text-ink-soft hover:border-ink-faint hover:bg-canvas",
              ].join(" ")}
            >
              <span className="text-xl">{meta.emoji}</span>
              <span className="text-[11px] font-medium leading-tight">
                {locale === "zh" ? meta.label : meta.labelEn}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Question + upload panel (only shown after category is chosen) */}
      {selectedCat && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: question statement */}
          <section className="card p-6">
            {selected ? (
              <div className="space-y-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[15px] font-semibold leading-snug">
                    {locale === "zh" ? selected.title : (selected.titleEn ?? selected.title)}
                  </h2>
                  <button
                    onClick={handleRoll}
                    className="shrink-0 rounded-lg border border-ink-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink-faint hover:bg-canvas"
                    title={t("practice.roll")}
                  >
                    {t("practice.roll")}
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <DomainBadge domain={selected.domain} />
                  <DifficultyBadge difficulty={selected.difficulty} />
                </div>

                {/* Question content */}
                <div className="rounded-xl bg-canvas px-5 py-5">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {questionContent(selected, locale)}
                  </p>
                </div>

                {/* Method hints (hidden by default) */}
                {selected.conceptTags.length > 0 && (
                  <div>
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
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-ink-faint">
                {t("practice.noQs")}
              </p>
            )}
          </section>

          {/* Right: upload */}
          <section className="card p-6">
            <label className="eyebrow mb-2.5 block">{t("practice.uploadLabel")}</label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-line px-6 py-12 text-center transition-colors hover:border-ink-faint hover:bg-canvas/60"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-64 rounded-lg border border-ink-line object-contain"
                />
              ) : (
                <>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-canvas text-2xl">
                    ↑
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-soft">{t("practice.dropTitle")}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{t("practice.dropHint")}</p>
                  </div>
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
              className="btn-primary mt-6 w-full"
            >
              {submitting ? t("practice.submitting") : t("practice.submit")}
            </button>
            <p className="mt-2.5 text-center text-xs text-ink-faint">{t("practice.submitHint")}</p>
          </section>
        </div>
      )}
    </div>
  );
}
