"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "./LocaleContext";
import type { MessageKey } from "@/lib/i18n";

const LINKS: { href: string; key: MessageKey }[] = [
  { href: "/", key: "nav.dashboard" },
  { href: "/practice", key: "nav.practice" },
  { href: "/mistakes", key: "nav.mistakes" },
  { href: "/papers", key: "nav.papers" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-20 border-b border-ink-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-9">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-base font-semibold text-paper">
              ∑
            </span>
            <span className="text-[15px] font-semibold tracking-tight">{t("app.title")}</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-sm font-medium transition-colors ${
                    active ? "text-ink" : "text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  {t(l.key)}
                  {active && (
                    <span className="absolute -bottom-[18px] left-0 h-[2px] w-full rounded-full bg-ink" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Language toggle */}
        <div className="flex items-center rounded-full border border-ink-line bg-paper p-0.5 text-xs font-medium">
          {(["zh", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                locale === l ? "bg-ink text-paper" : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {l === "zh" ? "中文" : "EN"}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-6 border-t border-ink-line px-6 py-3 md:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium ${active ? "text-ink" : "text-ink-faint"}`}
            >
              {t(l.key)}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
