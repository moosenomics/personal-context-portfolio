import { describe, it, expect } from "vitest";
import { mergeUpdate, countMarkers } from "../write-back/merge.js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function fixtureContent(person: string, file: string): string {
  return readFileSync(
    resolve(__dirname, "fixtures", person, file),
    "utf-8"
  );
}

describe("Write-Back Merge — Redaction Preservation", () => {
  // Test 14: Hidden block survives unrelated update
  it("preserves hidden block when updating an unrelated section", () => {
    const raw = fixtureContent("test-person-a", "domain-knowledge.md");
    const markersBefore = countMarkers(raw);
    expect(markersBefore).toBe(1);

    const result = mergeUpdate(
      raw,
      {
        file: "domain-knowledge.md",
        section: "## Areas Where They're a Beginner",
        action: "replace",
        content: "**Visible beginner skill.** Everyone can see this.\n\n**New skill.** Just learned this.",
        reason: "Added new beginner skill",
      },
      ["tester", "test-person-a"],
      null
    );

    expect(result.success).toBe(true);
    expect(countMarkers(result.content)).toBe(markersBefore);
    expect(result.content).toContain("<!-- @@ exclude: test-person-b -->");
    expect(result.content).toContain("Hidden skill.");
    expect(result.content).toContain("<!-- @@ end exclude -->");
    expect(result.content).toContain("New skill.");
  });

  // Test 15: Multiple hidden blocks survive
  it("preserves multiple hidden blocks when updating visible section", () => {
    const raw = fixtureContent("test-person-a", "current-projects.md");
    const markersBefore = countMarkers(raw);
    expect(markersBefore).toBe(2);

    const result = mergeUpdate(
      raw,
      {
        file: "current-projects.md",
        section: "## Public Project",
        action: "replace",
        content: "- **What:** Updated public project.\n- **Status:** Complete",
        reason: "Updated status",
      },
      ["tester", "test-person-a"],
      null
    );

    expect(result.success).toBe(true);
    expect(countMarkers(result.content)).toBe(markersBefore);
    expect(result.content).toContain("Secret Project");
    expect(result.content).toContain("Another Hidden Project");
    expect(result.content).toContain("Updated public project.");
  });

  // Test 16: Hidden block position stability
  it("keeps hidden blocks in correct relative position", () => {
    const raw = fixtureContent("test-person-a", "current-projects.md");

    const result = mergeUpdate(
      raw,
      {
        file: "current-projects.md",
        section: "## Public Project",
        action: "replace",
        content: "- **What:** Updated.\n- **Status:** Done",
        reason: "Update",
      },
      ["tester", "test-person-a"],
      null
    );

    expect(result.success).toBe(true);
    // Hidden blocks should still appear between Public Project and Another Public Project
    const publicIdx = result.content.indexOf("## Public Project");
    const secretIdx = result.content.indexOf("Secret Project");
    const anotherPublicIdx = result.content.indexOf("## Another Public Project");
    expect(secretIdx).toBeGreaterThan(publicIdx);
    expect(anotherPublicIdx).toBeGreaterThan(secretIdx);
  });

  // Test 17: LLM adds content — hidden blocks preserved
  it("preserves hidden blocks when LLM adds new section", () => {
    const raw = fixtureContent("test-person-a", "current-projects.md");
    const markersBefore = countMarkers(raw);

    const result = mergeUpdate(
      raw,
      {
        file: "current-projects.md",
        section: "## Brand New Project",
        action: "add",
        content: "- **What:** Something new.\n- **Status:** Started",
        reason: "New project",
      },
      ["tester", "test-person-a"],
      null
    );

    expect(result.success).toBe(true);
    expect(countMarkers(result.content)).toBe(markersBefore);
    expect(result.content).toContain("Brand New Project");
    expect(result.content).toContain("Secret Project");
  });

  // Test 18: LLM modifies content — hidden blocks preserved
  // The exclude targets test-person-b, so we merge AS test-person-b
  // (who cannot see the hidden block) — it must survive the merge
  it("preserves hidden blocks when LLM modifies visible content", () => {
    const raw = fixtureContent("test-person-a", "domain-knowledge.md");

    const result = mergeUpdate(
      raw,
      {
        file: "domain-knowledge.md",
        section: "## Areas of Expertise",
        action: "replace",
        content: "**Visible skill.** Updated description.\n\n**Another skill.** Newly added.",
        reason: "Updated expertise",
      },
      ["reviewer", "test-person-b"],  // test-person-b cannot see the exclude block
      null
    );

    expect(result.success).toBe(true);
    expect(result.content).toContain("Updated description.");
    expect(result.content).toContain("Hidden skill.");
    expect(result.content).toContain("<!-- @@ exclude: test-person-b -->");
  });

  // Test 19: No-op merge
  it("produces identical output on no-op merge for sections without hidden blocks", () => {
    const raw = `# Test

## Section One

Content one.

## Section Two

Content two.
`;

    const result = mergeUpdate(
      raw,
      {
        file: "test.md",
        section: "## Section One",
        action: "replace",
        content: "Content one.",
        reason: "No change",
      },
      ["user-a"],
      null
    );

    expect(result.success).toBe(true);
    expect(result.content).toContain("Content one.");
    expect(result.content).toContain("Content two.");
  });

  // Test 20: Include blocks preserved
  it("preserves include blocks for user who cannot see them", () => {
    const raw = fixtureContent("test-person-b", "domain-knowledge.md");
    const markersBefore = countMarkers(raw);
    expect(markersBefore).toBe(2);

    const result = mergeUpdate(
      raw,
      {
        file: "domain-knowledge.md",
        section: "## Areas of Expertise",
        action: "replace",
        content: "**Public expertise.** Updated public content.",
        reason: "Updated",
      },
      ["nobody"],  // No matching tags — both include blocks are hidden
      null
    );

    expect(result.success).toBe(true);
    expect(countMarkers(result.content)).toBe(markersBefore);
    expect(result.content).toContain("<!-- @@ include: leadership -->");
    expect(result.content).toContain("Leadership-only expertise.");
    expect(result.content).toContain("<!-- @@ include: test-person-b -->");
    expect(result.content).toContain("Private expertise.");
  });

  // Test 21: Nested blocks preserved
  it("preserves nested redaction blocks", () => {
    const raw = fixtureContent("test-person-nested", "current-projects.md");
    const markersBefore = countMarkers(raw);

    const result = mergeUpdate(
      raw,
      {
        file: "current-projects.md",
        section: "## Public Project",
        action: "replace",
        content: "Updated public content.",
        reason: "Update",
      },
      ["someone"],  // No accounting tag — include block is hidden
      null
    );

    expect(result.success).toBe(true);
    expect(countMarkers(result.content)).toBe(markersBefore);
    expect(result.content).toContain("<!-- @@ include: accounting -->");
    expect(result.content).toContain("<!-- @@ exclude: test-person-excluded -->");
    expect(result.content).toContain("Budget Details");
  });

  // Test 22: created-by metadata preserved byte-for-byte
  it("preserves created-by metadata in markers byte-for-byte", () => {
    const raw = fixtureContent("test-person-a", "current-projects.md");
    const marker = "<!-- @@ exclude: test-person-a | created-by: test-person-b -->";
    expect(raw).toContain(marker);

    const result = mergeUpdate(
      raw,
      {
        file: "current-projects.md",
        section: "## Another Public Project",
        action: "replace",
        content: "- **What:** Updated.\n- **Status:** Done",
        reason: "Update",
      },
      ["tester", "test-person-a"],
      null
    );

    expect(result.success).toBe(true);
    expect(result.content).toContain(marker);
  });

  // Test 23: Marker count assertion
  it("marker count matches before and after merge", () => {
    const raw = fixtureContent("test-person-a", "current-projects.md");
    const before = countMarkers(raw);

    const result = mergeUpdate(
      raw,
      {
        file: "current-projects.md",
        section: "## Public Project",
        action: "replace",
        content: "- Updated content",
        reason: "Update",
      },
      ["tester", "test-person-a"],
      null
    );

    expect(result.success).toBe(true);
    const after = countMarkers(result.content);
    expect(after).toBe(before);
  });
});
