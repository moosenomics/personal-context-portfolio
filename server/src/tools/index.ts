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
  missingRolesWarningWithContent,
  viewAsWarningWithContent,
} from "../messages/index.js";
import { executeWriteBack } from "../write-back/index.js";
import { isLLMConfigured } from "../llm/index.js";

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

/**
 * Wraps a tool handler so every text response is prepended with
 * [Authenticated as: Name (person-id)]. Anchors client AIs to the
 * authenticated identity, preventing inference from org index data.
 */
function makeIdentityWrapper(storage: StorageProvider, userId: string) {
  let cachedPrefix: string | null = null;

  async function getPrefix(): Promise<string> {
    if (cachedPrefix !== null) return cachedPrefix;
    const displayName = await extractDisplayName(storage, userId);
    cachedPrefix = `[Authenticated as: ${displayName} (${userId})]\n\n`;
    return cachedPrefix;
  }

  // Use generic inference variables P and R so contextual typing from
  // server.tool flows through the wrapper to the inner handler. This
  // preserves both parameter types and literal return types.
  return function withIdentity<P extends readonly unknown[], R>(
    handler: (...args: P) => Promise<R>
  ): (...args: P) => Promise<R> {
    return async (...args: P): Promise<R> => {
      const result = await handler(...args);
      const prefix = await getPrefix();
      const r = result as unknown as { content?: unknown };
      if (r && Array.isArray(r.content)) {
        for (const item of r.content as Array<{ type?: string; text?: string }>) {
          if (item && item.type === "text" && typeof item.text === "string") {
            item.text = prefix + item.text;
          }
        }
      }
      return result;
    };
  };
}

export function registerTools(
  server: McpServer,
  storage: StorageProvider,
  userId: string
): void {
  const withIdentity = makeIdentityWrapper(storage, userId);
  // Tool 1: get_my_portfolio
  server.tool(
    "get_my_portfolio",
    "Retrieve your complete personal context portfolio — all files about you including your identity, role, current projects, team relationships, tools, communication style, goals, preferences, domain knowledge, and decision log. Use this when the user asks about themselves broadly, wants a full overview, or says 'get my portfolio.'",
    {},
    withIdentity(async () => {
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
    })
  );

  // Tool 2: get_my_portfolio_file
  server.tool(
    "get_my_portfolio_file",
    "Retrieve a specific file from your own personal context portfolio. Files include: identity, role-and-responsibilities, current-projects, team-and-relationships, tools-and-systems, communication-style, goals-and-priorities, preferences-and-constraints, domain-knowledge, decision-log. Use this when the user asks about a specific aspect of themselves, like 'what are my current projects?' or 'show me my communication style.'",
    { file_name: z.string().describe("File name without .md extension (e.g., 'identity', 'current-projects'). Valid values: identity, role-and-responsibilities, current-projects, team-and-relationships, tools-and-systems, communication-style, goals-and-priorities, preferences-and-constraints, domain-knowledge, decision-log.") },
    withIdentity(async ({ file_name }) => {
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
    })
  );

  // Tool 3: get_my_roles
  server.tool(
    "get_my_roles",
    "Retrieve your organizational role tags. These tags determine which content you can see in other people's portfolios. Use this when the user asks what roles they have, what groups they belong to, or why they can or cannot see certain content.",
    {},
    withIdentity(async () => {
      const roles = await storage.getRoles(userId);
      const allTags = [...roles, userId];

      let text = `Your access tags:\n${allTags.map((t) => `- ${t}`).join("\n")}`;

      if (roles.length === 0) {
        text += `\n\n${missingRolesWarning(userId)}`;
      }

      return { content: [{ type: "text", text }] };
    })
  );

  // Tool 4: get_portfolio_file
  server.tool(
    "get_portfolio_file",
    "Retrieve a specific file from another person's portfolio. Use this when the user asks about someone else — their communication style, current projects, role, etc. Content is filtered based on your access level — you may not see everything in their file. Available files: identity, role-and-responsibilities, current-projects, team-and-relationships, tools-and-systems, communication-style, goals-and-priorities, preferences-and-constraints, domain-knowledge, decision-log.",
    {
      person_id: z.string().describe("The person's identifier (e.g., 'jim-halpert'). Use list_people to find valid person-ids."),
      file_name: z.string().describe("File name without .md extension (e.g., 'identity', 'current-projects')."),
    },
    withIdentity(async ({ person_id, file_name }) => {
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
    })
  );

  // Tool 5: get_full_portfolio
  server.tool(
    "get_full_portfolio",
    "Retrieve another person's complete portfolio — all their files. Content is filtered based on your access level. Use this when the user explicitly asks for someone's full portfolio, or when you need comprehensive context about a person (e.g., preparing for a meeting). For targeted questions about a person, prefer get_portfolio_file with the specific relevant file instead.",
    {
      person_id: z.string().describe("The person's identifier (e.g., 'jim-halpert')."),
    },
    withIdentity(async ({ person_id }) => {
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
    })
  );

  // Tool 6: list_people
  server.tool(
    "list_people",
    "List all people who have portfolios in the system. Returns person identifiers and names. Use this when the user asks who's in the system, wants to look someone up, or you need to verify a person-id before making another call.",
    {},
    withIdentity(async () => {
      const people = await storage.listPeople();
      const entries: string[] = [];

      for (const { personId } of people) {
        const displayName = await extractDisplayName(storage, personId);
        entries.push(`- **${displayName}** (${personId})`);
      }

      return {
        content: [{ type: "text", text: `# People in the System\n\n${entries.join("\n")}` }],
      };
    })
  );

  // Tool 7: list_files
  server.tool(
    "list_files",
    "List all portfolio files available for a specific person. Returns file names. Use this when you need to know what files exist for someone before retrieving a specific one, or when the user asks what information is available about a person.",
    {
      person_id: z.string().describe("The person's identifier (e.g., 'jim-halpert')."),
    },
    withIdentity(async ({ person_id }) => {
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
    })
  );

  // Tool 8: get_org_index
  server.tool(
    "get_org_index",
    "Retrieve the organizational index — a summary of all people in the system with their names, roles, and reporting relationships. Use this when the user asks about the org structure, who reports to whom, or needs an overview of the team before diving into individual portfolios.",
    {},
    withIdentity(async () => {
      const index = await generateOrgIndex(storage);
      return { content: [{ type: "text", text: index }] };
    })
  );

  // Tool 9: get_profile_freshness
  server.tool(
    "get_profile_freshness",
    "Check when a person's profile files were last updated. Use this to identify stale profiles that may need review, or to see if a profile has been recently updated.",
    {
      person_id: z.string().describe("Person identifier (e.g., 'michael-scott')."),
    },
    withIdentity(async ({ person_id }) => {
      if (person_id.includes("/") || person_id.includes("\\") || person_id.includes("..")) {
        return {
          content: [{ type: "text" as const, text: invalidIdError(person_id) }],
          isError: true,
        };
      }

      try {
        const files = await storage.listFilesWithDates(person_id);
        const displayName = await extractDisplayName(storage, person_id);

        const lines = files.map((f) => {
          const name = f.fileName.replace(/\.md$/, "");
          return `- **${name}**: ${f.lastModified}`;
        });

        return {
          content: [{
            type: "text" as const,
            text: `# Profile Freshness: ${displayName} (${person_id})\n\n${lines.join("\n")}`,
          }],
        };
      } catch {
        const availableIds = await getAvailablePersonIds(storage);
        return {
          content: [{ type: "text" as const, text: personNotFoundError(person_id, availableIds) }],
          isError: true,
        };
      }
    })
  );

  // Tool 10: submit_profile_updates
  server.tool(
    "submit_profile_updates",
    "Submit profile updates after a thorough conversation review. This is the primary end-of-session tool for harvesting what was learned about the user during a conversation. Before calling this, review the entire conversation and identify specific, concrete observations about the user — new projects, decisions made, tools adopted, priority changes, relationship updates, etc. Each observation should be one clear sentence. The server normalizes observations into structured portfolio content using AI, then merges changes into the appropriate files. Use the session_diff prompt for guided harvest workflow.",
    {
      observations: z.array(z.string()).min(1).describe(
        "Plain-text observations from the conversation. Each observation describes something learned about the user. Examples: 'Started managing the Jenkins pipeline', 'Decided to prioritize API rewrite over mobile app', 'Now using Terraform for infrastructure'"
      ),
      visibility: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe(
        "Optional redaction scoping for the new content. If provided, inserted content will be wrapped in redaction markers. Example: { exclude: ['michael-scott', 'dwight-schrute'] }"
      ),
    },
    withIdentity(async ({ observations, visibility }) => {
      try {
        const result = await executeWriteBack(storage, {
          personId: userId,
          observations,
          visibility,
        });

        const response: Record<string, unknown> = {
          status: result.status,
          files_updated: result.files_updated,
          skipped_observations: result.skipped_observations,
          visibility_applied: result.visibility_applied,
          change_history_id: result.change_history_id,
        };

        if (result.warnings.length > 0) {
          response.warnings = result.warnings;
        }

        return {
          content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{
            type: "text" as const,
            text: err instanceof Error ? err.message : String(err),
          }],
          isError: true,
        };
      }
    })
  );

  // Tool 11: update_my_profile
  server.tool(
    "update_my_profile",
    "Quick ad-hoc profile update for mid-conversation changes. Use this when the user mentions something specific that should be saved right away — a new tool they're using, a project status change, a decision they just made. For comprehensive end-of-session reviews, prefer submit_profile_updates or the session_diff prompt instead.",
    {
      observations: z.array(z.string()).min(1).describe(
        "Plain-text observations to save. Each observation describes something learned about the user."
      ),
      visibility: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe(
        "Optional redaction scoping for the new content."
      ),
    },
    withIdentity(async ({ observations, visibility }) => {
      try {
        const result = await executeWriteBack(storage, {
          personId: userId,
          observations,
          visibility,
        });

        const response: Record<string, unknown> = {
          status: result.status,
          files_updated: result.files_updated,
          skipped_observations: result.skipped_observations,
          visibility_applied: result.visibility_applied,
          change_history_id: result.change_history_id,
        };

        if (result.warnings.length > 0) {
          response.warnings = result.warnings;
        }

        return {
          content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{
            type: "text" as const,
            text: err instanceof Error ? err.message : String(err),
          }],
          isError: true,
        };
      }
    })
  );

  // Tool 12: view_portfolio_as
  server.tool(
    "view_portfolio_as",
    "View a person's portfolio file from a different person's perspective. This shows what the target viewer would see, filtered through BOTH the viewer's access AND your own access. You cannot see more than you normally would — this only lets you see less. Use this when the user wants to verify their redaction settings ('what does Michael see in my profile?') or explore how content looks from another person's perspective.",
    {
      person_id: z.string().describe("The person whose portfolio to view."),
      viewer_person_id: z.string().describe("The person whose perspective to view from."),
      file_name: z.string().optional().describe("Specific file name without .md extension. If omitted, returns all files."),
    },
    withIdentity(async ({ person_id, viewer_person_id, file_name }) => {
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

      try {
        if (file_name) {
          const fileName = normalizeFileName(file_name);
          const content = await storage.read(person_id, fileName);
          // Double redaction: viewer's tags first, then requester's tags
          const viewerFiltered = applyRedaction(content, viewerTags);
          const doubleFiltered = applyRedaction(viewerFiltered, requesterTags);
          return {
            content: [{ type: "text", text: viewAsWarningWithContent(userId, viewer_person_id, doubleFiltered) }],
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
            content: [{ type: "text", text: viewAsWarningWithContent(userId, viewer_person_id, sections.join("\n\n---\n\n")) }],
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
    })
  );
}
