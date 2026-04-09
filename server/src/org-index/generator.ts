import type { StorageProvider } from "../storage/types.js";

interface PersonEntry {
  name: string;
  role: string;
  personId: string;
}

function extractField(content: string, field: string): string | null {
  const regex = new RegExp(`^\\*\\*${field}:\\*\\*\\s*(.+)$`, "m");
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

export async function generateOrgIndex(
  storage: StorageProvider
): Promise<string> {
  const people = await storage.listPeople();
  const entries: PersonEntry[] = [];

  for (const { personId } of people) {
    let name = "Unknown";
    let role = "Unknown";

    try {
      const content = await storage.read(personId, "identity.md");
      name = extractField(content, "Name") ?? "Unknown";
      role = extractField(content, "Role") ?? "Unknown";
    } catch {
      console.error(`[PCP] ⚠ Could not read identity.md for ${personId}`);
    }

    entries.push({ name, role, personId });
  }

  const rows = entries
    .map((e) => `| ${e.name} | ${e.role} | ${e.personId} |`)
    .join("\n");

  return `# Organizational Index

| Name | Role | Person ID |
|------|------|-----------|
${rows}
`;
}
