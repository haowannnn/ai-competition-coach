"use client";

import { useLocale } from "./LocaleContext";

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className="mx-auto max-w-content px-6 py-12 text-center text-xs text-ink-faint">
      {t("footer.note")}
    </footer>
  );
}
