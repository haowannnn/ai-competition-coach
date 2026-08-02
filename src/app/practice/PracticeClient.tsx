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
        setSelectedCat((cat) => {
          if (cat) {
            const pool = qs.filter((q) => q.category === cat);
            setSelected(pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);
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
    <div className="space-y-10">
      <header>
        <h1 className="text-display font-semibold tracking-tight">{t("practice.title")}</h1>
        <p className="mt-2 text-sm text-ink-faint">{t("practice.subtitle")}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* Left: topic list (plain text, no icons) */}
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
                    active
                      ? "bg-ink text-paper"
                      : "text-ink-faint hover:bg-canvas hover:text-ink",
                  ].join(" ")}
                >
                  {locale === "zh" ? meta.label : meta.labelEn}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right: workspace */}
        <div className="min-w-0">
          {!selectedCat ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-ink-line">
              <p className="text-sm text-ink-faint">{t("practice.pickPrompt")}</p>
            </div>
          ) : !selected ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-ink-line">
              <p className="text-sm text-ink-faint">{t("practice.noQs")}</p>
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
