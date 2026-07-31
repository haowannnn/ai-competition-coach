import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getQuestion, addSubmission, getSubmissions } from "@/lib/db";
import { gradeSubmission } from "@/lib/anthropic";
import type { Submission, Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

// GET /api/submissions -> all submissions for the (single) user, newest first.
export async function GET() {
  return NextResponse.json({ submissions: await getSubmissions() });
}

// POST /api/submissions  (multipart form: questionId, image, locale)
// Grades the image with Claude and stores the result.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const questionId = String(form.get("questionId") || "");
    const locale: Locale = form.get("locale") === "en" ? "en" : "zh";
    const file = form.get("image");

    if (!questionId) {
      return NextResponse.json({ error: "missing questionId" }, { status: 400 });
    }
    const question = getQuestion(questionId);
    if (!question) {
      return NextResponse.json({ error: "question not found" }, { status: 404 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing image file" }, { status: 400 });
    }

    // Determine extension from filename / mimetype.
    let ext = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      if (file.type === "image/jpeg") ext = ".jpg";
      else if (file.type === "image/webp") ext = ".webp";
      else if (file.type === "image/gif") ext = ".gif";
      else ext = ".png";
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = bytes.toString("base64");

    // Persist the upload locally (public/uploads).
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const fileName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), bytes);
    const imagePath = `/uploads/${fileName}`;

    // Grade with Claude (or mock fallback).
    const aiResult = await gradeSubmission(question, base64, ext, locale);

    const submission: Submission = {
      id: `sub_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      questionId: question.id,
      imagePath,
      aiResult,
      createdAt: new Date().toISOString(),
    };
    await addSubmission(submission);

    return NextResponse.json({ submission });
  } catch (err) {
    console.error("[POST /api/submissions] error:", err);
    return NextResponse.json({ error: "failed to process submission" }, { status: 500 });
  }
}
