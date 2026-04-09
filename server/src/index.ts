import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { FilesystemStorageProvider } from "./storage/filesystem.js";
import { runStartupValidation } from "./validation/startup.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { userNotConfiguredError } from "./messages/index.js";
import { initLLM } from "./llm/index.js";
import { loadApiKeys, resolveApiKey } from "./auth/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createMcpServer(
  storage: FilesystemStorageProvider,
  userId: string
): McpServer {
  const server = new McpServer({
    name: "pcp-mcp-server",
    version: "1.0.0",
  });

  registerTools(server, storage, userId);
  registerResources(server, storage, userId);
  registerPrompts(server, storage, userId);

  return server;
}

async function startStdio(storage: FilesystemStorageProvider): Promise<void> {
  const userId = process.env.PCP_USER_ID;
  if (!userId) {
    console.error(userNotConfiguredError());
    process.exit(1);
  }

  await runStartupValidation(storage, storage.portfoliosDir, userId);

  const server = createMcpServer(storage, userId);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[PCP] Server running as ${userId} (stdio transport)`);
}

async function startHttp(storage: FilesystemStorageProvider): Promise<void> {
  await loadApiKeys();

  // Validate portfolios directory without requiring a specific user
  await runStartupValidation(storage, storage.portfoliosDir, null);

  const port = parseInt(process.env.PORT || "8080");

  // Track sessions: sessionId → { transport, server }
  const sessions = new Map<
    string,
    { transport: StreamableHTTPServerTransport; server: McpServer }
  >();

  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);

    // CORS headers for MCP clients
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Mcp-Session-Id"
    );
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (url.pathname === "/health" && req.method === "GET") {
      const people = await storage.listPeople();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          version: "1.0.0",
          profiles_loaded: people.length,
          transport: "http",
        })
      );
      return;
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      // Auth middleware
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error:
              "IDENTITY FAILURE. No API key provided in the Authorization header. " +
              "Format: Authorization: Bearer <api-key>. " +
              "— D. K. Schrute, Security Task Force",
          })
        );
        return;
      }

      const apiKey = authHeader.slice(7);
      const personId = resolveApiKey(apiKey);

      if (!personId) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error:
              `SECURITY BREACH DETECTED. The API key "${apiKey}" is not recognized. ` +
              "— D. K. Schrute, Security Task Force",
          })
        );
        return;
      }

      // Parse body for POST requests
      if (req.method === "POST") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        }
        const bodyStr = Buffer.concat(chunks).toString("utf-8");
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(bodyStr);
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON body" }));
          return;
        }

        // Check for existing session
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (sessionId && sessions.has(sessionId)) {
          // Existing session — route to its transport
          const session = sessions.get(sessionId)!;
          await session.transport.handleRequest(req, res, parsedBody);
          return;
        }

        // New session — check if this is an initialization request
        const body = parsedBody as { method?: string };
        if (body.method === "initialize" || !sessionId) {
          // Create new per-session MCP server + transport
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sid) => {
              console.error(`[PCP] Session ${sid} initialized for ${personId}`);
              sessions.set(sid, { transport, server: mcpServer });
            },
            onsessionclosed: (sid) => {
              console.error(`[PCP] Session ${sid} closed`);
              sessions.delete(sid);
            },
          });

          const mcpServer = createMcpServer(storage, personId);
          await mcpServer.connect(transport);
          await transport.handleRequest(req, res, parsedBody);
          return;
        }

        // Session ID provided but not found
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Session not found" }));
        return;
      }

      if (req.method === "GET" || req.method === "DELETE") {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;
        if (sessionId && sessions.has(sessionId)) {
          const session = sessions.get(sessionId)!;
          await session.transport.handleRequest(req, res);
          return;
        }
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Session not found" }));
        return;
      }

      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    // 404 for everything else
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  httpServer.listen(port, () => {
    console.error(`[PCP] Server listening on port ${port} (http transport)`);
  });
}

async function main(): Promise<void> {
  const portfoliosDir = resolve(
    process.env.PCP_PORTFOLIOS_DIR ?? resolve(__dirname, "..", "..", "portfolios")
  );

  const storage = new FilesystemStorageProvider(portfoliosDir);

  // Initialize LLM providers (may be unconfigured — that's OK for read-only use)
  initLLM();

  const transport = process.env.PCP_TRANSPORT ?? (process.env.PORT ? "http" : "stdio");

  if (transport === "http") {
    await startHttp(storage);
  } else {
    await startStdio(storage);
  }
}

main().catch((err) => {
  console.error("[PCP] Fatal error:", err);
  process.exit(1);
});
