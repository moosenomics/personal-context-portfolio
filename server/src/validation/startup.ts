import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { StorageProvider } from "../storage/types.js";
import { stripNumberedPrefixes } from "../storage/filesystem.js";

const CANONICAL_FILES = [
  "identity.md",
  "role-and-responsibilities.md",
  "current-projects.md",
  "team-and-relationships.md",
  "tools-and-systems.md",
  "communication-style.md",
  "goals-and-priorities.md",
  "preferences-and-constraints.md",
  "domain-knowledge.md",
  "decision-log.md",
];

export async function runStartupValidation(
  storage: StorageProvider,
  portfoliosDir: string,
  userId: string | null
): Promise<void> {
  console.error(`[PCP] Validating portfolios at ${portfoliosDir}...`);

  // Check portfolios directory exists
  try {
    await access(portfoliosDir);
  } catch {
    console.error(
      `[PCP] FATAL: Portfolios directory not found at ${portfoliosDir}`
    );
    process.exit(1);
  }

  // List people
  const people = await storage.listPeople();

  if (people.length === 0) {
    console.error("[PCP] ⚠ No person directories found in portfolios directory");
    console.error("[PCP] Validation complete: 0 people, 1 warning");
    return;
  }

  console.error(`[PCP] Found ${people.length} people`);

  let warnings = 0;

  for (const { personId } of people) {
    const dirPath = join(portfoliosDir, personId);

    // Strip numbered prefixes (e.g., 01-identity.md → identity.md) before validation
    await stripNumberedPrefixes(dirPath);

    // Check canonical files
    let dirEntries: string[];
    try {
      dirEntries = await readdir(dirPath);
    } catch {
      console.error(`[PCP] ⚠ ${personId}: could not read directory`);
      warnings++;
      continue;
    }

    for (const canonical of CANONICAL_FILES) {
      if (!dirEntries.includes(canonical)) {
        console.error(`[PCP] ⚠ ${personId}: missing ${canonical}`);
        warnings++;
      }
    }

    // Check _roles.md
    if (!dirEntries.includes("_roles.md")) {
      console.error(
        `[PCP] ⚠ ${personId}: missing _roles.md (will have no role tags)`
      );
      warnings++;
    }

    // Scan for unmatched redaction markers
    for (const entry of dirEntries) {
      if (!entry.endsWith(".md")) continue;

      try {
        const content = await readFile(join(dirPath, entry), "utf-8");
        const lines = content.split("\n");
        const stack: Array<{ type: string; line: number }> = [];

        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim();
          if (/^<!--\s*@@\s*include:/.test(trimmed)) {
            stack.push({ type: "include", line: i + 1 });
          } else if (/^<!--\s*@@\s*exclude:/.test(trimmed)) {
            stack.push({ type: "exclude", line: i + 1 });
          } else if (/^<!--\s*@@\s*end\s+include\s*-->$/.test(trimmed)) {
            const idx = findLastIndex(stack, (f) => f.type === "include");
            if (idx >= 0) {
              stack.splice(idx, 1);
            } else {
              console.error(
                `[PCP] ⚠ ${personId}: unmatched <!-- @@ end include --> at line ${i + 1} in ${entry}`
              );
              warnings++;
            }
          } else if (/^<!--\s*@@\s*end\s+exclude\s*-->$/.test(trimmed)) {
            const idx = findLastIndex(stack, (f) => f.type === "exclude");
            if (idx >= 0) {
              stack.splice(idx, 1);
            } else {
              console.error(
                `[PCP] ⚠ ${personId}: unmatched <!-- @@ end exclude --> at line ${i + 1} in ${entry}`
              );
              warnings++;
            }
          }
        }

        for (const frame of stack) {
          console.error(
            `[PCP] ⚠ ${personId}: unmatched <!-- @@ ${frame.type} --> at line ${frame.line} in ${entry}`
          );
          warnings++;
        }
      } catch {
        // Skip files we can't read
      }
    }
  }

  // Verify PCP_USER_ID (only for stdio transport where userId is set at startup)
  if (userId) {
    const userExists = await storage.exists(userId);
    if (!userExists) {
      console.error(
        `[PCP] ⚠ PCP_USER_ID "${userId}" does not match any person directory`
      );
      warnings++;
    }
  }

  console.error(
    `[PCP] Validation complete: ${people.length} people, ${warnings} warning${warnings === 1 ? "" : "s"}`
  );
}

function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}
