import type { SubmissionStore } from "./types";
import { fileStore } from "./fileStore";

// Pick the storage driver. Today only "file" exists; to go live later, add a
// supabaseStore.ts implementing SubmissionStore and switch on an env var:
//
//   const driver = process.env.STORE_DRIVER ?? "file";
//   export const store = driver === "supabase" ? supabaseStore : fileStore;
//
// The rest of the app is unaffected because everything talks to this `store`.
export const store: SubmissionStore = fileStore;
