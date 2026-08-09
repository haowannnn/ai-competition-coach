"use client";

import { InlineMath, BlockMath } from "react-katex";

// Renders a plain string that may contain LaTeX delimited by `$...$` (inline)
// or `$$...$$` (block). Everything outside the delimiters is kept as plain
// text, with newlines preserved. Malformed LaTeX degrades to the raw source
// instead of throwing, so a bad formula never blanks the page.
//
// Content in this app is stored as plain strings (not markdown), so this is
// the single place that turns `$…$` into rendered math. Question text, model
// answers and AI feedback all flow through here.

type Token =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

// Split on $$...$$ first (block), then $...$ (inline). A lone/unbalanced `$`
// is treated as literal text. `\$` is an escaped literal dollar sign.
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let buf = "";

  const flush = () => {
    if (buf) {
      tokens.push({ type: "text", value: buf });
      buf = "";
    }
  };

  while (i < input.length) {
    const ch = input[i];

    // Escaped dollar → literal.
    if (ch === "\\" && input[i + 1] === "$") {
      buf += "$";
      i += 2;
      continue;
    }

    if (ch === "$") {
      const isBlock = input[i + 1] === "$";
      const delim = isBlock ? "$$" : "$";
      const closeFrom = i + delim.length;
      const close = findClose(input, closeFrom, delim);
      if (close !== -1) {
        const value = input.slice(closeFrom, close).trim();
        if (value) {
          flush();
          tokens.push({ type: isBlock ? "block" : "inline", value });
        }
        i = close + delim.length;
        continue;
      }
      // No matching close → literal dollar.
      buf += ch;
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }
  flush();
  return tokens;
}

// Find the closing delimiter, skipping escaped dollars.
function findClose(input: string, from: number, delim: string): number {
  for (let j = from; j < input.length; j++) {
    if (input[j] === "\\") {
      j++; // skip escaped char
      continue;
    }
    if (delim === "$$") {
      if (input[j] === "$" && input[j + 1] === "$") return j;
    } else if (input[j] === "$") {
      return j;
    }
  }
  return -1;
}

export default function MathText({
  children,
  className,
}: {
  children: string | null | undefined;
  className?: string;
}) {
  const text = children ?? "";
  const tokens = tokenize(text);

  // Fast path: no math at all → plain text node, preserving whitespace.
  const hasMath = tokens.some((t) => t.type !== "text");
  if (!hasMath) {
    return <span className={className} style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
  }

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }}>
      {tokens.map((tk, idx) => {
        if (tk.type === "text") return <span key={idx}>{tk.value}</span>;
        if (tk.type === "block") {
          return (
            <span key={idx} className="my-2 block overflow-x-auto">
              <BlockMath math={tk.value} errorColor="#b91c1c" />
            </span>
          );
        }
        return <InlineMath key={idx} math={tk.value} errorColor="#b91c1c" />;
      })}
    </span>
  );
}
