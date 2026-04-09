import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));

let apiKeyMap: Map<string, string> | null = null;

export async function loadApiKeys(): Promise<void> {
  const configPath = resolve(__dirname, "..", "..", "config", "api-keys.json");
  try {
    const raw = await readFile(configPath, "utf-8");
    const data = JSON.parse(raw) as Record<string, string>;
    apiKeyMap = new Map(Object.entries(data));
    console.error(`[PCP] Loaded ${apiKeyMap.size} API keys`);
  } catch (err) {
    console.error(`[PCP] Warning: Could not load API keys from ${configPath}:`, err);
    apiKeyMap = new Map();
  }
}

export function resolveApiKey(apiKey: string): string | null {
  if (!apiKeyMap) return null;
  return apiKeyMap.get(apiKey) ?? null;
}

export function authMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error:
          "IDENTITY FAILURE. No API key provided in the Authorization header. " +
          "You are attempting to access a secured system without credentials. " +
          "This is the digital equivalent of breaking into a locked building " +
          "without even trying the door handle first. Format: Authorization: Bearer <api-key>. " +
          "— D. K. Schrute, Security Task Force",
      })
    );
    return;
  }

  const apiKey = authHeader.slice(7); // Strip "Bearer "
  const personId = resolveApiKey(apiKey);

  if (!personId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error:
          `SECURITY BREACH DETECTED. The API key "${apiKey}" is not recognized ` +
          "in this facility's credential registry. Either your key has been revoked, " +
          "or you are an imposter. I am trained in over 200 forms of authentication " +
          "verification, and this is not one of the valid ones. " +
          "— D. K. Schrute, Security Task Force",
      })
    );
    return;
  }

  // Attach personId to the request for downstream use
  (req as IncomingMessage & { personId: string }).personId = personId;
  next();
}
