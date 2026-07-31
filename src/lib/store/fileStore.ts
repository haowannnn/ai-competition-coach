import fs from "fs";
import path from "path";
import type { Submission } from "../types";
import type { SubmissionStore } from "./types";

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

export const fileStore: SubmissionStore = {
  async list() {
    return [...load().submissions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  async get(id) {
    return load().submissions.find((s) => s.id === id);
  },
  async add(sub) {
    const data = load();
    data.submissions.push(sub);
    persist(data);
    return sub;
  },
};
