import type { Submission } from "./types";
import { SEED_QUESTIONS } from "./seed";
import { store } from "./store";

// Questions are static seed content (read-only). Submissions live in the
// pluggable store (file-backed now, cloud DB later).

export function getQuestions() {
  return SEED_QUESTIONS;
}

export function getQuestion(id: string) {
  return SEED_QUESTIONS.find((q) => q.id === id);
}

export async function getSubmissions(): Promise<Submission[]> {
  return store.list();
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  return store.get(id);
}

export async function addSubmission(sub: Submission): Promise<Submission> {
  return store.add(sub);
}
