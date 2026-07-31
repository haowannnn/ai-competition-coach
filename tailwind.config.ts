import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutral canvas + near-black ink — calm, editorial, "ins" feel.
        canvas: "#f7f6f3",
        paper: "#ffffff",
        ink: {
          DEFAULT: "#1a1a1a",
          soft: "#4a4a48",
          faint: "#8a8a86",
          line: "#eae8e3",
        },
        // Single restrained accent.
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#5b5bd6",
          600: "#4f46e5",
          700: "#4338ca",
        },
        good: "#3f9d6d",
        warn: "#c98a2b",
        bad: "#c65454",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      fontSize: {
        "display": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(26,26,26,0.03), 0 12px 32px -12px rgba(26,26,26,0.08)",
        lift: "0 2px 6px rgba(26,26,26,0.04), 0 20px 48px -16px rgba(26,26,26,0.12)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
