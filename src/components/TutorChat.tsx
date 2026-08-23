"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleContext";
import MathText from "./MathText";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

// Socratic follow-up chat for a graded submission. Hidden behind a "still don't
// get it" trigger so the result page stays clean until the student wants to dig in.
export default function TutorChat({ submissionId }: { submissionId: string }) {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(history: Msg[]) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, locale, messages: history }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setError(true);
      setMessages(history); // keep the user's turn; let them retry
    } finally {
      setLoading(false);
    }
  }

  // First open: kick off the conversation with an implicit "I don't get it".
  function start() {
    setOpen(true);
    const opener: Msg = { role: "user", content: t("tutor.opener") };
    setMessages([opener]);
    send([opener]);
  }

  function submit() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    send(next);
  }

  if (!open) {
    return (
      <button onClick={start} className="btn-ghost w-full">
        {t("tutor.trigger")}
      </button>
    );
  }

  return (
    <section className="card flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-ink-line px-5 py-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-600/12 text-sm text-accent-600">
          ✦
        </span>
        <div>
          <p className="text-sm font-semibold">{t("tutor.title")}</p>
          <p className="text-xs text-ink-faint">{t("tutor.sub")}</p>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-96 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <MathText
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-accent-600 text-paper"
                  : "bg-canvas text-ink-soft"
              }`}
            >
              {m.content}
            </MathText>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <span className="inline-flex gap-1 rounded-2xl bg-canvas px-4 py-3">
              <Dot /> <Dot /> <Dot />
            </span>
          </div>
        )}
        {error && (
          <p className="text-center text-xs text-bad">{t("tutor.error")}</p>
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-ink-line px-4 py-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={t("tutor.placeholder")}
          className="max-h-32 flex-1 resize-none rounded-xl border border-ink-line bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent-600"
        />
        <button
          onClick={submit}
          disabled={loading || !input.trim()}
          className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("tutor.send")}
        </button>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint" />;
}
