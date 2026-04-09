import type { StorageProvider } from "../storage/types.js";
import { applyRedaction } from "../redaction/parser.js";
import {
  normalize,
  isLLMConfigured,
  NORMALIZATION_SYSTEM_PROMPT,
} from "../llm/index.js";
import type { NormalizationResponse, NormalizationUpdate } from "../llm/types.js";
import { mergeUpdate } from "./merge.js";
import { appendChangeEntry } from "../history/index.js";
import type { ChangeDetail } from "../history/index.js";

/** Internal files that must never be written via normalization. */
const INTERNAL_FILES = new Set(["_roles.md", "_redaction-legend.md", "_change-history.json"]);

export interface WriteBackInput {
  personId: string;
  observations: string[];
  visibility?: {
    include?: string[];
    exclude?: string[];
  };
}

export interface WriteBackFileResult {
  content: string;
  warnings?: string[];
}

export interface WriteBackResult {
  status: "success" | "error";
  files_updated: Record<string, string>;
  skipped_observations: Array<{ observation: string; reason: string }>;
  visibility_applied: { include?: string[]; exclude?: string[] } | null;
  change_history_id: string;
  warnings: string[];
}

async function getUserTags(
  storage: StorageProvider,
  userId: string
): Promise<string[]> {
  const roles = await storage.getRoles(userId);
  return [...roles, userId];
}

/**
 * Parse the LLM's JSON response, with one retry on invalid JSON.
 */
function parseNormalizationResponse(raw: string): NormalizationResponse {
  // Strip markdown fences if the LLM wrapped them anyway
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    cleaned = cleaned.slice(firstNewline + 1);
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();
  }

  return JSON.parse(cleaned) as NormalizationResponse;
}

/**
 * Execute the full write-back pipeline:
 * 1. Verify authorship
 * 2. Read user's redacted portfolio
 * 3. Send to LLM for normalization
 * 4. Merge normalized content into raw files
 * 5. Log change history
 * 6. Return results
 */
export async function executeWriteBack(
  storage: StorageProvider,
  input: WriteBackInput
): Promise<WriteBackResult> {
  const { personId, observations, visibility } = input;
  const warnings: string[] = [];

  if (!isLLMConfigured()) {
    throw new Error(
      "SYSTEM FAILURE. The LLM normalization engine is not configured. " +
      "Profile updates require server-side intelligence, and right now this server " +
      "has the cognitive capacity of a goldfish. Configure PCP_LLM_PRIMARY_PROVIDER, " +
      "PCP_LLM_PRIMARY_API_KEY, and PCP_LLM_PRIMARY_MODEL environment variables. " +
      "— D. K. Schrute, Security Task Force"
    );
  }

  // Step 1: Read the user's full portfolio (redacted view for LLM context)
  const userTags = await getUserTags(storage, personId);
  const allFiles = await storage.readAll(personId);
  const redactedPortfolio: Map<string, string> = new Map();

  for (const [fileName, content] of allFiles) {
    redactedPortfolio.set(fileName, applyRedaction(content, userTags));
  }

  // Step 2: Build the user message for the LLM
  const portfolioText = Array.from(redactedPortfolio.entries())
    .map(([fileName, content]) => `### ${fileName}\n\n${content}`)
    .join("\n\n---\n\n");

  const observationsText = observations
    .map((obs, i) => `${i + 1}. ${obs}`)
    .join("\n");

  const userMessage = `## Current Portfolio for ${personId}\n\n${portfolioText}\n\n---\n\n## New Observations\n\n${observationsText}\n\nAnalyze these observations and produce the appropriate updates to this person's portfolio files. Follow the density rules and voice guidelines strictly.`;

  // Step 3: Call LLM normalization (with retry on invalid JSON)
  let normResponse: NormalizationResponse;
  let llmRaw: string;

  try {
    llmRaw = await normalize(NORMALIZATION_SYSTEM_PROMPT, userMessage);
    normResponse = parseNormalizationResponse(llmRaw);
  } catch (firstError) {
    // Retry once on JSON parse failure
    if (firstError instanceof SyntaxError) {
      console.error("[PCP] LLM returned invalid JSON, retrying...");
      try {
        llmRaw = await normalize(NORMALIZATION_SYSTEM_PROMPT, userMessage);
        normResponse = parseNormalizationResponse(llmRaw);
      } catch (retryError) {
        throw new Error(
          "CATASTROPHIC INTELLIGENCE FAILURE. The normalization engine returned " +
          "gibberish not once, but TWICE. This is the kind of incompetence I expect " +
          "from Jim, not from a machine learning model. Try again later. " +
          "— D. K. Schrute, Security Task Force"
        );
      }
    } else {
      throw firstError;
    }
  }

  // Step 4: Filter out updates targeting internal files
  const validUpdates: NormalizationUpdate[] = [];
  for (const update of normResponse.updates) {
    if (INTERNAL_FILES.has(update.file)) {
      console.error(
        `[PCP] Warning: LLM tried to update internal file "${update.file}" — skipping`
      );
      continue;
    }
    validUpdates.push(update);
  }

  // Step 5: Merge each update into raw files
  // Collect all changes per file, then write atomically
  const fileChanges = new Map<string, string>(); // fileName → merged content
  const changeDetails: ChangeDetail[] = [];
  const filesUpdated: Record<string, string> = {};

  for (const update of validUpdates) {
    // Read the raw file (or use already-merged version if multiple updates to same file)
    let rawContent: string;
    if (fileChanges.has(update.file)) {
      rawContent = fileChanges.get(update.file)!;
    } else {
      try {
        rawContent = await storage.read(personId, update.file);
      } catch {
        // File doesn't exist — for "add" action, start with empty file
        if (update.action === "add" || update.action === "append") {
          rawContent = `# ${update.file.replace(/\.md$/, "").replace(/-/g, " ")}\n`;
        } else {
          warnings.push(
            `Hey, so... the file "${update.file}" doesn't seem to exist. ` +
            `I'm not going to make a big deal about it, but the update to section ` +
            `"${update.section}" couldn't be applied. It's probably fine. ` +
            `— Toby Flenderson, Human Resources`
          );
          continue;
        }
      }
    }

    // Determine visibility for this update
    let effectiveVisibility: { include?: string[]; exclude?: string[] } | null = null;
    if (visibility) {
      effectiveVisibility = visibility;
    } else if (update.suggested_visibility) {
      effectiveVisibility = {
        include: update.suggested_visibility.include,
        exclude: update.suggested_visibility.exclude,
      };
      console.error(
        `[PCP] Applying LLM-suggested visibility for ${update.file}: ${JSON.stringify(effectiveVisibility)}`
      );
    }

    const result = mergeUpdate(rawContent, update, userTags, effectiveVisibility);

    if (result.success) {
      fileChanges.set(update.file, result.content);
      filesUpdated[update.file] = update.content;

      changeDetails.push({
        file: update.file,
        section: update.section,
        action: update.action,
        previous_content: result.previousContent,
        new_content: update.content,
        reason: update.reason,
        visibility_applied: effectiveVisibility,
      });
    } else if (result.warning) {
      warnings.push(result.warning);
    }
  }

  // Step 6: Write all changes atomically
  // If any write fails, none should persist — collect all writes first
  const writeOps: Array<{ fileName: string; content: string }> = [];
  for (const [fileName, content] of fileChanges) {
    writeOps.push({ fileName, content });
  }

  try {
    for (const op of writeOps) {
      await storage.writeFile(personId, op.fileName, op.content);
    }
  } catch (writeError) {
    throw new Error(
      "FILE SYSTEM BREACH. The write operation failed, which means someone — " +
      "or something — is interfering with our storage infrastructure. I have " +
      "protocols for this. Do NOT touch the server. " +
      `Technical details: ${writeError}. ` +
      "— D. K. Schrute, Security Task Force"
    );
  }

  // Step 7: Log change history
  const timestamp = new Date().toISOString();
  await appendChangeEntry(storage, personId, {
    timestamp,
    person_id: personId,
    files_updated: Object.keys(filesUpdated),
    observations,
    changes: changeDetails,
  });

  return {
    status: "success",
    files_updated: filesUpdated,
    skipped_observations: normResponse.skipped_observations ?? [],
    visibility_applied: visibility ?? null,
    change_history_id: timestamp,
    warnings,
  };
}
