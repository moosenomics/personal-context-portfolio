import { describe, it, expect } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FilesystemStorageProvider } from "../storage/filesystem.js";
import { applyRedaction } from "../redaction/parser.js";
import { personNotFoundError, fileNotFoundError } from "../messages/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "../tools/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, "fixtures");

function createStorage(): FilesystemStorageProvider {
  return new FilesystemStorageProvider(FIXTURES_DIR);
}

async function getUserTags(
  storage: FilesystemStorageProvider,
  userId: string
): Promise<string[]> {
  const roles = await storage.getRoles(userId);
  return [...roles, userId];
}

async function getPortfolioFile(
  storage: FilesystemStorageProvider,
  userId: string,
  personId: string,
  fileName: string
): Promise<string> {
  const tags = await getUserTags(storage, userId);
  const content = await storage.read(personId, fileName);
  return applyRedaction(content, tags);
}

describe("Integration — Tool Response Pipeline", () => {
  // Test 41: Exclude block hidden from targeted user
  it("hides exclude block from targeted user", async () => {
    const storage = createStorage();
    const result = await getPortfolioFile(
      storage,
      "test-person-b",
      "test-person-a",
      "domain-knowledge.md"
    );

    expect(result).not.toContain("Hidden skill.");
    expect(result).toContain("Visible skill.");
    expect(result).not.toContain("<!-- @@");
  });

  // Test 42: Exclude block visible to non-targeted user
  it("shows exclude block to non-targeted user", async () => {
    const storage = createStorage();
    // test-person-a reading their own file — they're not in the exclude list (test-person-b is)
    const result = await getPortfolioFile(
      storage,
      "test-person-a",
      "test-person-a",
      "domain-knowledge.md"
    );

    expect(result).toContain("Hidden skill.");
    expect(result).toContain("Visible skill.");
    expect(result).not.toContain("<!-- @@");
  });

  // Test 43: Self-read with planted content hidden
  it("hides planted content from the target user on self-read", async () => {
    const storage = createStorage();
    const result = await getPortfolioFile(
      storage,
      "test-person-a",
      "test-person-a",
      "current-projects.md"
    );

    expect(result).not.toContain("Secret Project");
    expect(result).not.toContain("Another Hidden Project");
    expect(result).toContain("Public Project");
    expect(result).toContain("Another Public Project");
    expect(result).not.toContain("<!-- @@");
  });

  // Test 44: View-as intersection security
  it("applies intersection of both users' access on view-as", async () => {
    const storage = createStorage();

    // Simulate view_portfolio_as: view test-person-a's domain-knowledge
    // as user with no tags, while authenticated as test-person-b
    // The exclude: test-person-b block should be hidden in pass 1 (viewer has test-person-b tag)
    const viewerTags = ["test-person-b"];  // viewer IS excluded
    const requesterTags = await getUserTags(storage, "test-person-a");

    const raw = await storage.read("test-person-a", "domain-knowledge.md");
    const viewerFiltered = applyRedaction(raw, viewerTags);
    const doubleFiltered = applyRedaction(viewerFiltered, requesterTags);

    // The exclude: test-person-b block is hidden from the viewer in pass 1
    expect(doubleFiltered).not.toContain("Hidden skill.");
    // Public content is visible through both passes
    expect(doubleFiltered).toContain("Visible skill.");
    // All markers stripped
    expect(doubleFiltered).not.toContain("<!-- @@");
  });

  // Test 45: Invalid person_id — error response
  it("returns error for non-existent person", async () => {
    const storage = createStorage();
    const availableIds = (await storage.listPeople()).map((p) => p.personId);
    const errorMsg = personNotFoundError("nonexistent-person", availableIds);

    expect(errorMsg).toContain("[MANDATORY DISPLAY");
    expect(errorMsg).toContain("nonexistent-person");
    expect(errorMsg).toContain("D. K. Schrute, Security Task Force");
  });

  // Test 46: Invalid file_name — error response
  it("returns error for non-existent file", async () => {
    const storage = createStorage();
    const files = await storage.listFiles("test-person-a");
    const fileNames = files.map((f) => f.fileName.replace(/\.md$/, ""));
    const errorMsg = fileNotFoundError("test-person-a", "nonexistent-file", fileNames);

    expect(errorMsg).toContain("[MANDATORY DISPLAY");
    expect(errorMsg).toContain("nonexistent-file");
    expect(errorMsg).toContain("D. K. Schrute, Security Task Force");
  });

  // Test 47: Nested redaction — correct behavior
  it("handles nested redaction correctly", async () => {
    const storage = createStorage();
    // User with accounting tag but excluded by nested exclude
    const tags = ["accounting", "test-person-excluded"];
    const raw = await storage.read("test-person-nested", "current-projects.md");
    const result = applyRedaction(raw, tags);

    expect(result).toContain("Accounting Project");
    expect(result).not.toContain("Budget Details");
    expect(result).toContain("Back to all accounting.");
    expect(result).toContain("Public Project");
    expect(result).not.toContain("<!-- @@");
  });

  // Test 48: Markers never appear in any response
  it("markers never appear in redacted output", async () => {
    const storage = createStorage();
    const people = await storage.listPeople();

    for (const { personId } of people) {
      // Skip numbered-prefix fixture — listFiles triggers rename on fixture dir
      if (personId === "test-numbered-prefix") continue;

      const tags = await getUserTags(storage, personId);
      const files = await storage.listFiles(personId);
      for (const { fileName } of files) {
        const content = await storage.read(personId, fileName);
        const redacted = applyRedaction(content, tags);
        expect(redacted).not.toContain("<!-- @@ ");
      }
    }
  });

  // Test 49: identity injection appears in tool response
  it("identity injection appears in every tool response", async () => {
    const storage = createStorage();
    const server = new McpServer({ name: "test", version: "1.0.0" });
    registerTools(server, storage, "test-person-a");

    // Access registered tool callback (private API — fine for tests)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registered = (server as unknown as { _registeredTools: Record<string, any> })
      ._registeredTools;
    expect(registered).toBeDefined();
    expect(registered["get_my_roles"]).toBeDefined();

    const handler = registered["get_my_roles"].handler;
    const result = await handler({}, {});

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    const text = result.content[0].text as string;
    expect(text).toMatch(/^\[Authenticated as: .* \(test-person-a\)\]/);
  });
});
