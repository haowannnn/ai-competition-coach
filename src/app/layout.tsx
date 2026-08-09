import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { LocaleProvider } from "@/components/LocaleContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Competition Math AI Coach",
  description:
    "Upload your solution, get AI grading, error localization, weak-concept tracking and personalized practice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <LocaleProvider>
          <NavBar />
          <main className="mx-auto max-w-content px-6 py-10 md:py-14">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
