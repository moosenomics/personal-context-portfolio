import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { StorageProvider } from "../storage/types.js";
import { applyRedaction } from "../redaction/parser.js";
import { generateOrgIndex } from "../org-index/generator.js";
import {
  personNotFoundError,
  fileNotFoundError,
  invalidIdError,
  missingRolesWarning,
  viewAsWarning,
} from "../messages/index.js";

async function getUserTags(
  storage: StorageProvider,
  userId: string
): Promise<string[]> {
  const roles = await storage.getRoles(userId);
  return [...roles, userId];
}

async function redactContent(
  storage: StorageProvider,
  userId: string,
  content: string
): Promise<string> {
  const tags = await getUserTags(storage, userId);
  return applyRedaction(content, tags);
}

async function getAvailablePersonIds(
  storage: StorageProvider
): Promise<string[]> {
  const people = await storage.listPeople();
  return people.map((p) => p.personId);
}

async function getAvailableFileNames(
  storage: StorageProvider,
  personId: string
): Promise<string[]> {
  const files = await storage.listFiles(personId);
  return files.map((f) => f.fileName.replace(/\.md$/, ""));
}

function normalizeFileName(name: string): string {
  return name.endsWith(".md") ? name : `${name}.md`;
}

async function extractDisplayName(
  storage: StorageProvider,
  personId: string
): Promise<string> {
  try {
    const content = await storage.read(personId, "identity.md");
    const nameMatch = content.match(/^\*\*Name:\*\*\s*(.+)$/m);
    if (nameMatch) return nameMatch[1].trim();
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) return headingMatch[1].trim();
  } catch {
    // fall through
  }
  return personId;
}

export function registerTools(
  server: McpServer,
  storage: StorageProvider,
  userId: string
): void {
  // Tool 1: get_my_portfolio
  server.tool(
    "get_my_portfolio",
    "Retrieve your complete personal context portfolio — all files about you including your identity, role, current projects, team relationships, tools, communication style, goals, preferences, domain knowledge, and decision log. Use this when the user asks about themselves broadly, wants a full overview, or says 'get my portfolio.'",
    {},
    async () => {
      try {
        const files = await storage.readAll(userId);
        const sections: string[] = [];
        const tags = await getUserTags(storage, userId);

        for (const [fileName, content] of files) {
          const redacted = applyRedaction(content, tags);
          sections.push(`## ${fileName}\n\n${redacted}`);
        }

        return { content: [{ type: "text", text: sections.join("\n\n---\n\n") }] };
      } catch (err) {
        const availableIds = await getAvailablePersonIds(storage);
        return {
          content: [{ type: "text", text: personNotFoundError(userId, availableIds) }],
          isError: true,
        };
      }
    }
  );

  // Tool 2: get_my_portfolio_file
  server.tool(
    "get_my_portfolio_file",
    "Retrieve a specific file from your own personal context portfolio. Files include: identity, role-and-responsibilities, current-projects, team-and-relationships, tools-and-systems, communication-style, goals-and-priorities, preferences-and-constraints, domain-knowledge, decision-log. Use this when the user asks about a specific aspect of themselves, like 'what are my current projects?' or 'show me my communication style.'",
    { file_name: z.string().describe("File name without .md extension (e.g., 'identity', 'current-projects'). Valid values: identity, role-and-responsibilities, current-projects, team-and-relationships, tools-and-systems, communication-style, goals-and-priorities, preferences-and-constraints, domain-knowledge, decision-log.") },
    async ({ file_name }) => {
      const fileName = normalizeFileName(file_name);
      try {
        const content = await storage.read(userId, fileName);
        const redacted = await redactContent(storage, userId, content);
        return { content: [{ type: "text", text: redacted }] };
      } catch {
        try {
          const availableFiles = await getAvailableFileNames(storage, userId);
          return {
            content: [{ type: "text", text: fileNotFoundError(userId, file_name, availableFiles) }],
            isError: true,
          };
        } catch {
          const availableIds = await getAvailablePersonIds(storage);
          return {
            content: [{ type: "text", text: personNotFoundError(userId, availableIds) }],
            isError: true,
          };
        }
      }
    }
  );

  // Tool 3: get_my_roles
  server.tool(
    "get_my_roles",
    "Retrieve your organizational role tags. These tags determine which content you can see in other people's portfolios. Use this when the user asks what roles they have, what groups they belong to, or why they can or cannot see certain content.",
    {},
    async () => {
      const roles = await storage.getRoles(userId);
      const allTags = [...roles, userId];

      let text = `Your access tags:\n${allTags.map((t) => `- ${t}`).join("\n")}`;

      if (roles.length === 0) {
        text += `\n\n${missingRolesWarning(userId)}`;
      }

      return { content: [{ type: "text", text }] };
    }
  );

  // Tool 4: get_portfolio_file
  server.tool(
    "get_portfolio_file",
    "Retrieve a specific file from another person's portfolio. Use this when the user asks about someone else — their communication style, current projects, role, etc. Content is filtered based on your access level — you may not see everything in their file. Available files: identity, role-and-responsibilities, current-projects, team-and-relationships, tools-and-systems, communication-style, goals-and-priorities, preferences-and-constraints, domain-knowledge, decision-log.",
    {
      person_id: z.string().describe("The person's identifier (e.g., 'jim-halpert'). Use list_people to find valid person-ids."),
      file_name: z.string().describe("File name without .md extension (e.g., 'identity', 'current-projects')."),
    },
    async ({ person_id, file_name }) => {
      // Validate person_id
      if (person_id.includes("/") || person_id.includes("\\") || person_id.includes("..")) {
        return {
          content: [{ type: "text", text: invalidIdError(person_id) }],
          isError: true,
        };
      }

      const fileName = normalizeFileName(file_name);

      try {
        const content = await storage.read(person_id, fileName);
        const redacted = await redactContent(storage, userId, content);
        return { content: [{ type: "text", text: redacted }] };
      } catch {
        // Determine which error to show
        const exists = await storage.exists(person_id);
        if (!exists) {
          const availableIds = await getAvailablePersonIds(storage);
          return {
            content: [{ type: "text", text: personNotFoundError(person_id, availableIds) }],
            isError: true,
          };
        }
        const availableFiles = await getAvailableFileNames(storage, person_id);
        return {
          content: [{ type: "text", text: fileNotFoundError(person_id, file_name, availableFiles) }],
          isError: true,
        };
      }
    }
  );

  // Tool 5: get_full_portfolio
  server.tool(
    "get_full_portfolio",
    "Retrieve another person's complete portfolio — all their files. Content is filtered based on your access level. Use this when the user explicitly asks for someone's full portfolio, or when you need comprehensive context about a person (e.g., preparing for a meeting). For targeted questions about a person, prefer get_portfolio_file with the specific relevant file instead.",
    {
      person_id: z.string().describe("The person's identifier (e.g., 'jim-halpert')."),
    },
    async ({ person_id }) => {
      if (person_id.includes("/") || person_id.includes("\\") || person_id.includes("..")) {
        return {
          content: [{ type: "text", text: invalidIdError(person_id) }],
          isError: true,
        };
      }

      try {
        const files = await storage.readAll(person_id);
        const tags = await getUserTags(storage, userId);
        const sections: string[] = [];

        for (const [fileName, content] of files) {
          const redacted = applyRedaction(content, tags);
          sections.push(`## ${fileName}\n\n${redacted}`);
        }

        return { content: [{ type: "text", text: sections.join("\n\n---\n\n") }] };
      } catch {
        const availableIds = await getAvailablePersonIds(storage);
        return {
          content: [{ type: "text", text: personNotFoundError(person_id, availableIds) }],
          isError: true,
        };
      }
    }
  );

  // Tool 6: list_people
  server.tool(
    "list_people",
    "List all people who have portfolios in the system. Returns person identifiers and names. Use this when the user asks who's in the system, wants to look someone up, or you need to verify a person-id before making another call.",
    {},
    async () => {
      const people = await storage.listPeople();
      const entries: string[] = [];

      for (const { personId } of people) {
        const displayName = await extractDisplayName(storage, personId);
        entries.push(`- **${displayName}** (${personId})`);
      }

      return {
        content: [{ type: "text", text: `# People in the System\n\n${entries.join("\n")}` }],
      };
    }
  );

  // Tool 7: list_files
  server.tool(
    "list_files",
    "List all portfolio files available for a specific person. Returns file names. Use this when you need to know what files exist for someone before retrieving a specific one, or when the user asks what information is available about a person.",
    {
      person_id: z.string().describe("The person's identifier (e.g., 'jim-halpert')."),
    },
    async ({ person_id }) => {
      if (person_id.includes("/") || person_id.includes("\\") || person_id.includes("..")) {
        return {
          content: [{ type: "text", text: invalidIdError(person_id) }],
          isError: true,
        };
      }

      try {
        const files = await storage.listFiles(person_id);
        const names = files.map((f) => `- ${f.fileName.replace(/\.md$/, "")}`);
        return {
          content: [{ type: "text", text: `# Files for ${person_id}\n\n${names.join("\n")}` }],
        };
      } catch {
        const availableIds = await getAvailablePersonIds(storage);
        return {
          content: [{ type: "text", text: personNotFoundError(person_id, availableIds) }],
          isError: true,
        };
      }
    }
  );

  // Tool 8: get_org_index
  server.tool(
    "get_org_index",
    "Retrieve the organizational index — a summary of all people in the system with their names, roles, and reporting relationships. Use this when the user asks about the org structure, who reports to whom, or needs an overview of the team before diving into individual portfolios.",
    {},
    async () => {
      const index = await generateOrgIndex(storage);
      return { content: [{ type: "text", text: index }] };
    }
  );

  // Tool 9: view_portfolio_as
  server.tool(
    "view_portfolio_as",
    "View a person's portfolio file from a different person's perspective. This shows what the target viewer would see, filtered through BOTH the viewer's access AND your own access. You cannot see more than you normally would — this only lets you see less. Use this when the user wants to verify their redaction settings ('what does Michael see in my profile?') or explore how content looks from another person's perspective.",
    {
      person_id: z.string().describe("The person whose portfolio to view."),
      viewer_person_id: z.string().describe("The person whose perspective to view from."),
      file_name: z.string().optional().describe("Specific file name without .md extension. If omitted, returns all files."),
    },
    async ({ person_id, viewer_person_id, file_name }) => {
      // Validate IDs
      for (const id of [person_id, viewer_person_id]) {
        if (id.includes("/") || id.includes("\\") || id.includes("..")) {
          return {
            content: [{ type: "text", text: invalidIdError(id) }],
            isError: true,
          };
        }
      }

      // Check both people exist
      for (const id of [person_id, viewer_person_id]) {
        const exists = await storage.exists(id);
        if (!exists) {
          const availableIds = await getAvailablePersonIds(storage);
          return {
            content: [{ type: "text", text: personNotFoundError(id, availableIds) }],
            isError: true,
          };
        }
      }

      const viewerTags = await getUserTags(storage, viewer_person_id);
      const requesterTags = await getUserTags(storage, userId);

      const warning = viewAsWarning(userId, viewer_person_id);

      try {
        if (file_name) {
          const fileName = normalizeFileName(file_name);
          const content = await storage.read(person_id, fileName);
          // Double redaction: viewer's tags first, then requester's tags
          const viewerFiltered = applyRedaction(content, viewerTags);
          const doubleFiltered = applyRedaction(viewerFiltered, requesterTags);
          return {
            content: [{ type: "text", text: `${warning}\n\n---\n\n${doubleFiltered}` }],
          };
        } else {
          const files = await storage.readAll(person_id);
          const sections: string[] = [];

          for (const [fName, content] of files) {
            const viewerFiltered = applyRedaction(content, viewerTags);
            const doubleFiltered = applyRedaction(viewerFiltered, requesterTags);
            sections.push(`## ${fName}\n\n${doubleFiltered}`);
          }

          return {
            content: [{ type: "text", text: `${warning}\n\n---\n\n${sections.join("\n\n---\n\n")}` }],
          };
        }
      } catch {
        const availableFiles = await getAvailableFileNames(storage, person_id);
        return {
          content: [{
            type: "text",
            text: fileNotFoundError(person_id, file_name ?? "(all)", availableFiles),
          }],
          isError: true,
        };
      }
    }
  );
}
