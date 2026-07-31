"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleContext";
import { DifficultyBadge, DomainBadge, TagBadge } from "@/components/badges";
import { questionTitle, questionContent } from "@/lib/i18n";
import type { Question } from "@/lib/types";

export default function PracticeClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { locale, t } = useLocale();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data) => {
        const qs: Question[] = data.questions ?? [];
        setQuestions(qs);
        const fromUrl = params.get("questionId");
        setSelectedId(fromUrl && qs.some((q) => q.id === fromUrl) ? fromUrl : qs[0]?.id ?? "");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => questions.find((q) => q.id === selectedId) ?? null,
    [questions, selectedId]
  );

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display font-semibold">{t("practice.title")}</h1>
        <p className="mt-2 text-sm text-ink-faint">{t("practice.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: question selection + statement */}
        <section className="card p-6">
          <label className="eyebrow mb-2.5 block">{t("practice.select")}</label>
          <div className="relative mb-5">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-ink-line bg-paper px-4 py-3 text-sm font-medium focus:border-ink-faint focus:outline-none"
            >
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {questionTitle(q, locale)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint">
              ⌄
            </span>
          </div>

          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <DomainBadge domain={selected.domain} />
                <DifficultyBadge difficulty={selected.difficulty} />
              </div>
              <div className="rounded-xl bg-canvas px-5 py-5">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {questionContent(selected, locale)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.conceptTags.map((tag) => (
                  <TagBadge key={tag} tagId={tag} />
                ))}
              </div>
            </div>
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
              <button onClick={() => onPickFile(null)} className="ml-2 text-accent-600 hover:underline">
                {t("practice.remove")}
              </button>
            </p>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-bad/[0.06] px-3 py-2 text-sm text-bad">{error}</p>
          )}

          <button onClick={onSubmit} disabled={submitting} className="btn-primary mt-6 w-full">
            {submitting ? t("practice.submitting") : t("practice.submit")}
          </button>
          <p className="mt-2.5 text-center text-xs text-ink-faint">{t("practice.submitHint")}</p>
        </section>
      </div>
    </div>
  );
}
