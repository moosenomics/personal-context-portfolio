import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { FileInfo, PersonInfo, StorageProvider } from "./types.js";

function validatePathSegment(value: string, label: string): void {
  if (
    value.includes("/") ||
    value.includes("\\") ||
    value.includes("..")
  ) {
    throw new Error(
      `Invalid ${label}: "${value}" contains path separators or traversal sequences.`
    );
  }
}

export class FilesystemStorageProvider implements StorageProvider {
  constructor(private portfoliosDir: string) {}

  async read(personId: string, fileName: string): Promise<string> {
    validatePathSegment(personId, "person-id");
    validatePathSegment(fileName, "file-name");

    const filePath = join(this.portfoliosDir, personId, fileName);
    try {
      return await readFile(filePath, "utf-8");
    } catch {
      throw new Error(`File not found: ${fileName} for person ${personId}`);
    }
  }

  async readAll(personId: string): Promise<Map<string, string>> {
    const files = await this.listFiles(personId);
    const result = new Map<string, string>();
    for (const file of files) {
      const content = await this.read(personId, file.fileName);
      result.set(file.fileName, content);
    }
    return result;
  }

  async listFiles(personId: string): Promise<FileInfo[]> {
    validatePathSegment(personId, "person-id");

    const dirPath = join(this.portfoliosDir, personId);
    let entries: string[];
    try {
      entries = await readdir(dirPath);
    } catch {
      throw new Error(`Person not found: ${personId}`);
    }

    return entries
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .sort()
      .map((fileName) => ({ fileName, personId }));
  }

  async listPeople(): Promise<PersonInfo[]> {
    const entries = await readdir(this.portfoliosDir);
    const people: PersonInfo[] = [];

    for (const entry of entries) {
      const entryPath = join(this.portfoliosDir, entry);
      try {
        const s = await stat(entryPath);
        if (s.isDirectory()) {
          people.push({ personId: entry });
        }
      } catch {
        // Skip entries we can't stat
      }
    }

    return people.sort((a, b) => a.personId.localeCompare(b.personId));
  }

  async getRoles(personId: string): Promise<string[]> {
    validatePathSegment(personId, "person-id");

    try {
      const content = await readFile(
        join(this.portfoliosDir, personId, "_roles.md"),
        "utf-8"
      );
      return content
        .split("\n")
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2).trim());
    } catch {
      return [];
    }
  }

  async exists(personId: string): Promise<boolean> {
    validatePathSegment(personId, "person-id");

    try {
      const s = await stat(join(this.portfoliosDir, personId));
      return s.isDirectory();
    } catch {
      return false;
    }
  }
}
