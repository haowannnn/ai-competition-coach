import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ questions: getQuestions() });
}
