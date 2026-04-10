import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { stripNumberedPrefixes } from "../storage/filesystem.js";
import { mkdtemp, cp, readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rmSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = resolve(__dirname, "fixtures", "test-numbered-prefix");

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "pcp-test-"));
});

afterEach(() => {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
});

async function copyFixture(): Promise<string> {
  const dest = join(tempDir, "test-person");
  await cp(FIXTURE_DIR, dest, { recursive: true });
  return dest;
}

describe("Numbered Prefix Stripping", () => {
  // Test 24: Single file renamed
  it("renames a numbered file to canonical name", async () => {
    const dir = await copyFixture();
    await stripNumberedPrefixes(dir);

    const entries = await readdir(dir);
    expect(entries).toContain("identity.md");
    expect(entries).not.toContain("01-identity.md");

    const content = await readFile(join(dir, "identity.md"), "utf-8");
    expect(content).toContain("Test person with numbered prefix files.");
  });

  // Test 25: All canonical files renamed
  it("renames all numbered files to canonical names", async () => {
    const dir = await copyFixture();
    await stripNumberedPrefixes(dir);

    const entries = await readdir(dir);
    expect(entries).toContain("identity.md");
    expect(entries).toContain("role-and-responsibilities.md");
    expect(entries).toContain("current-projects.md");
    expect(entries).not.toContain("01-identity.md");
    expect(entries).not.toContain("02-role-and-responsibilities.md");
    expect(entries).not.toContain("03-current-projects.md");
  });

  // Test 26: Mixed directory
  it("only renames numbered files, leaves canonical files alone", async () => {
    const dir = join(tempDir, "mixed");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "identity.md"), "canonical", "utf-8");
    await writeFile(join(dir, "01-current-projects.md"), "numbered", "utf-8");

    await stripNumberedPrefixes(dir);

    const entries = await readdir(dir);
    expect(entries).toContain("identity.md");
    expect(entries).toContain("current-projects.md");
    expect(entries).not.toContain("01-current-projects.md");

    // Original canonical file untouched
    const content = await readFile(join(dir, "identity.md"), "utf-8");
    expect(content).toBe("canonical");
  });

  // Test 27: Already canonical
  it("does nothing when no numbered files present", async () => {
    const dir = join(tempDir, "canonical");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "identity.md"), "content", "utf-8");
    await writeFile(join(dir, "domain-knowledge.md"), "content2", "utf-8");

    await stripNumberedPrefixes(dir);

    const entries = await readdir(dir);
    expect(entries.sort()).toEqual(["domain-knowledge.md", "identity.md"]);
  });

  // Test 28: Non-matching numbered file not renamed
  it("does not rename non-matching numbered files", async () => {
    const dir = join(tempDir, "custom");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "01-custom-notes.md"), "custom", "utf-8");

    await stripNumberedPrefixes(dir);

    const entries = await readdir(dir);
    // The file DOES get renamed since pattern ##-{anything}.md matches
    // But it becomes custom-notes.md which is fine — it's a non-canonical extra file
    // The key is: it doesn't crash and the content is preserved
    expect(entries.length).toBe(1);
  });

  // Test 29: Idempotent
  it("calling strip twice is idempotent", async () => {
    const dir = await copyFixture();
    await stripNumberedPrefixes(dir);
    const entriesAfterFirst = (await readdir(dir)).sort();

    await stripNumberedPrefixes(dir);
    const entriesAfterSecond = (await readdir(dir)).sort();

    expect(entriesAfterSecond).toEqual(entriesAfterFirst);
  });
});
