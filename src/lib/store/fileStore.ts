import fs from "fs";
import path from "path";
import type { Submission } from "../types";
import type { SubmissionStore } from "./types";
import { demoSubmissions, isDemoEnabled } from "../demoData";

// File-backed store. Submissions are persisted to data/store.json, so records
// survive server restarts and browser sessions ("saved" locally). This stands
// in for the cloud DB during local development.

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

interface FileShape {
  submissions: Submission[];
}

function load(): FileShape {
  try {
    if (!fs.existsSync(STORE_PATH)) return { submissions: [] };
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
    return { submissions: Array.isArray(parsed?.submissions) ? parsed.submissions : [] };
  } catch {
    return { submissions: [] };
  }
}

function persist(data: FileShape): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Demo history is layered underneath any real submissions so the dashboard is
// never empty for a first-time visitor (e.g. an award judge opening the link),
// while anything the visitor uploads is persisted and shown on top. Demo ids
// are prefixed "demo-" so they never collide with real submissions.
function withDemo(real: Submission[]): Submission[] {
  if (!isDemoEnabled()) return real;
  return [...real, ...demoSubmissions()];
}

export const fileStore: SubmissionStore = {
  async list() {
    return withDemo(load().submissions).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  async get(id) {
    return withDemo(load().submissions).find((s) => s.id === id);
  },
  async add(sub) {
    const data = load();
    data.submissions.push(sub);
    persist(data);
    return sub;
  },
};
