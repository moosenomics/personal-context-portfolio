import type { StorageProvider } from "../storage/types.js";

export interface ChangeDetail {
  file: string;
  section: string | null;
  action: "replace" | "append" | "add";
  previous_content: string;
  new_content: string;
  reason: string;
  visibility_applied: { include?: string[]; exclude?: string[] } | null;
}

export interface ChangeEntry {
  timestamp: string;
  person_id: string;
  files_updated: string[];
  observations: string[];
  changes: ChangeDetail[];
}

const HISTORY_FILE = "_change-history.json";

export async function appendChangeEntry(
  storage: StorageProvider,
  personId: string,
  entry: ChangeEntry
): Promise<void> {
  const line = JSON.stringify(entry) + "\n";
  await storage.appendFile(personId, HISTORY_FILE, line);
}

export async function readChangeHistory(
  storage: StorageProvider,
  personId: string
): Promise<ChangeEntry[]> {
  try {
    const content = await storage.read(personId, HISTORY_FILE);
    return content
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as ChangeEntry);
  } catch {
    return [];
  }
}
