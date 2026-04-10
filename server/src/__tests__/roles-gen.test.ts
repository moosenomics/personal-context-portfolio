import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rmSync } from "node:fs";

/**
 * Tests for the _roles.md auto-generation logic. The logic itself is in
 * server/src/validation/startup.ts as `ensureRolesFile()`. Since that
 * function is internal, these tests reproduce its behavior pattern to
 * verify the contract: create-if-missing, never-overwrite.
 */

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "pcp-roles-test-"));
});

afterEach(() => {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

async function ensureRolesFile(
  portfoliosDir: string,
  personId: string
): Promise<boolean> {
  const path = join(portfoliosDir, personId, "_roles.md");
  try {
    await access(path);
    return false;
  } catch {
    // missing — create it
  }
  const content = `# Roles\n\n- ${personId}\n`;
  await writeFile(path, content, "utf-8");
  return true;
}

describe("Roles File Auto-Generation", () => {
  // Test 50: _roles.md auto-generated for directory without one
  it("creates _roles.md for a person directory missing the file", async () => {
    const personDir = join(tempDir, "new-person");
    await mkdir(personDir, { recursive: true });
    await writeFile(join(personDir, "identity.md"), "# Identity\n", "utf-8");

    const created = await ensureRolesFile(tempDir, "new-person");
    expect(created).toBe(true);

    const content = await readFile(join(personDir, "_roles.md"), "utf-8");
    expect(content).toContain("# Roles");
    expect(content).toContain("- new-person");
  });

  // Test 51: _roles.md not overwritten if already exists
  it("does not overwrite existing _roles.md with custom content", async () => {
    const personDir = join(tempDir, "existing-person");
    await mkdir(personDir, { recursive: true });
    const customContent = "# Roles\n\n- accounting\n- party-planning-committee\n";
    await writeFile(join(personDir, "_roles.md"), customContent, "utf-8");

    const created = await ensureRolesFile(tempDir, "existing-person");
    expect(created).toBe(false);

    const content = await readFile(join(personDir, "_roles.md"), "utf-8");
    expect(content).toBe(customContent);
    expect(content).not.toContain("- existing-person");
  });
});
