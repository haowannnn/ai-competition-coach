import type { Submission } from "../types";

// Storage abstraction. The app only depends on this interface, so swapping
// the file-backed implementation for a real cloud DB (Supabase / Vercel
// Postgres) later means adding one file and changing STORE_DRIVER — no page
// or API changes needed.
export interface SubmissionStore {
  list(): Promise<Submission[]>; // newest first
  get(id: string): Promise<Submission | undefined>;
  add(sub: Submission): Promise<Submission>;
}
