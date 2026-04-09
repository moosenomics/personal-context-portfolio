import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StorageProvider } from "../storage/types.js";
import { applyRedaction } from "../redaction/parser.js";
import { generateOrgIndex } from "../org-index/generator.js";

async function getUserTags(
  storage: StorageProvider,
  userId: string
): Promise<string[]> {
  const roles = await storage.getRoles(userId);
  return [...roles, userId];
}

export function registerResources(
  server: McpServer,
  storage: StorageProvider,
  userId: string
): void {
  // Resource: Portfolio Files (template)
  server.resource(
    "portfolio-file",
    new ResourceTemplate("pcp://portfolios/{personId}/{fileName}", {
      list: async () => {
        const people = await storage.listPeople();
        const resources: Array<{
          uri: string;
          name: string;
          mimeType: string;
        }> = [];

        for (const { personId } of people) {
          // Extract display name from identity.md
          let displayName = personId;
          try {
            const content = await storage.read(personId, "identity.md");
            const nameMatch = content.match(/^\*\*Name:\*\*\s*(.+)$/m);
            if (nameMatch) displayName = nameMatch[1].trim();
          } catch {
            // Use personId as fallback
          }

          try {
            const files = await storage.listFiles(personId);
            for (const { fileName } of files) {
              const prettyName = fileName.replace(/\.md$/, "").replace(/-/g, " ");
              resources.push({
                uri: `pcp://portfolios/${personId}/${fileName}`,
                name: `${displayName} — ${prettyName.charAt(0).toUpperCase() + prettyName.slice(1)}`,
                mimeType: "text/markdown",
              });
            }
          } catch {
            // Skip people whose files we can't list
          }
        }

        return { resources };
      },
    }),
    async (uri, params) => {
      const personId = params.personId as string;
      const fileName = params.fileName as string;

      const tags = await getUserTags(storage, userId);
      const content = await storage.read(personId, fileName);
      const redacted = applyRedaction(content, tags);

      return { contents: [{ uri: uri.href, text: redacted, mimeType: "text/markdown" }] };
    }
  );

  // Resource: Org Index (static)
  server.resource(
    "org-index",
    "pcp://org-index",
    async (uri) => {
      const index = await generateOrgIndex(storage);
      return { contents: [{ uri: uri.href, text: index, mimeType: "text/markdown" }] };
    }
  );
}
