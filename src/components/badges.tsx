"use client";

import type { Difficulty, ConceptDomain } from "@/lib/types";
import { domainLabel, tagLabel } from "@/lib/concepts";
import { useLocale } from "./LocaleContext";
import type { MessageKey } from "@/lib/i18n";

const DIFF_KEY: Record<Difficulty, MessageKey> = {
  easy: "diff.easy",
  medium: "diff.medium",
  hard: "diff.hard",
};

const DIFF_DOT: Record<Difficulty, string> = {
  easy: "bg-good",
  medium: "bg-warn",
  hard: "bg-bad",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { t } = useLocale();
  return (
    <span className="pill">
      <span className={`h-1.5 w-1.5 rounded-full ${DIFF_DOT[difficulty]}`} />
      {t(DIFF_KEY[difficulty])}
    </span>
  );
}

export function DomainBadge({ domain }: { domain: ConceptDomain }) {
  const { locale } = useLocale();
  return <span className="pill">{domainLabel(domain, locale)}</span>;
}

export function TagBadge({ tagId }: { tagId: string }) {
  const { locale } = useLocale();
  return (
    <span className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {tagLabel(tagId, locale)}
    </span>
  );
}

export function ErrorTypeBadge({ type }: { type: "knowledge" | "habitual" | null }) {
  const { t } = useLocale();
  if (!type) return null;
  const isKnowledge = type === "knowledge";
  return (
    <span
      className={`pill border-transparent ${
        isKnowledge ? "bg-bad/10 text-bad" : "bg-warn/10 text-warn"
      }`}
    >
      {t(isKnowledge ? "err.knowledge" : "err.habitual")}
    </span>
  );
}
