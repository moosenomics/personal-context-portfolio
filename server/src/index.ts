import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FilesystemStorageProvider } from "./storage/filesystem.js";
import { runStartupValidation } from "./validation/startup.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { userNotConfiguredError } from "./messages/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  // Read environment variables
  const userId = process.env.PCP_USER_ID;
  if (!userId) {
    console.error(userNotConfiguredError());
    process.exit(1);
  }

  const portfoliosDir = resolve(
    process.env.PCP_PORTFOLIOS_DIR ?? resolve(__dirname, "..", "..", "portfolios")
  );

  // Initialize storage
  const storage = new FilesystemStorageProvider(portfoliosDir);

  // Run startup validation
  await runStartupValidation(storage, portfoliosDir, userId);

  // Create MCP server
  const server = new McpServer({
    name: "pcp-mcp-server",
    version: "1.0.0",
  });

  // Register tools and resources
  registerTools(server, storage, userId);
  registerResources(server, storage, userId);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[PCP] Server running as ${userId}`);
}

main().catch((err) => {
  console.error("[PCP] Fatal error:", err);
  process.exit(1);
});
