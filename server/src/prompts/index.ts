import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StorageProvider } from "../storage/types.js";
import { applyRedaction } from "../redaction/parser.js";
import { buildSessionDiffPromptText } from "./session-diff.js";

export function registerPrompts(
  server: McpServer,
  storage: StorageProvider,
  userId: string
): void {
  server.prompt(
    "session_diff",
    "End-of-session profile review. Compares what was learned during this conversation against your current profile and suggests updates. Use this when wrapping up a work session.",
    {},
    async () => {
      // Read the authenticated user's full portfolio (redacted view)
      const roles = await storage.getRoles(userId);
      const userTags = [...roles, userId];
      const allFiles = await storage.readAll(userId);

      const redactedPortfolio = new Map<string, string>();
      for (const [fileName, content] of allFiles) {
        redactedPortfolio.set(fileName, applyRedaction(content, userTags));
      }

      const promptText = buildSessionDiffPromptText(redactedPortfolio);

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: promptText,
            },
          },
        ],
      };
    }
  );
}
