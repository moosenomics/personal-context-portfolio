import type { LLMProvider } from "./types.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAIProvider } from "./openai.js";

export type { LLMProvider, NormalizationUpdate, SkippedObservation, NormalizationResponse } from "./types.js";
export { NORMALIZATION_SYSTEM_PROMPT } from "./normalization-prompt.js";

function createProvider(
  providerName: string,
  apiKey: string,
  model: string
): LLMProvider {
  switch (providerName.toLowerCase()) {
    case "anthropic":
      return new AnthropicProvider(apiKey, model);
    case "openai":
      return new OpenAIProvider(apiKey, model);
    default:
      throw new Error(`Unknown LLM provider: ${providerName}`);
  }
}

let primaryProvider: LLMProvider | null = null;
let fallbackProvider: LLMProvider | null = null;

export function initLLM(): void {
  const primaryName = process.env.PCP_LLM_PRIMARY_PROVIDER;
  const primaryKey = process.env.PCP_LLM_PRIMARY_API_KEY;
  const primaryModel = process.env.PCP_LLM_PRIMARY_MODEL;

  if (primaryName && primaryKey && primaryModel) {
    primaryProvider = createProvider(primaryName, primaryKey, primaryModel);
    console.error(`[PCP] LLM primary: ${primaryName} (${primaryModel})`);
  } else {
    console.error("[PCP] LLM primary provider not configured — write-back tools will be unavailable");
  }

  const fallbackName = process.env.PCP_LLM_FALLBACK_PROVIDER;
  const fallbackKey = process.env.PCP_LLM_FALLBACK_API_KEY;
  const fallbackModel = process.env.PCP_LLM_FALLBACK_MODEL;

  if (fallbackName && fallbackKey && fallbackModel) {
    fallbackProvider = createProvider(fallbackName, fallbackKey, fallbackModel);
    console.error(`[PCP] LLM fallback: ${fallbackName} (${fallbackModel})`);
  }
}

export function isLLMConfigured(): boolean {
  return primaryProvider !== null;
}

export async function normalize(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (!primaryProvider) {
    throw new Error(
      "No LLM provider configured. Set PCP_LLM_PRIMARY_PROVIDER, PCP_LLM_PRIMARY_API_KEY, and PCP_LLM_PRIMARY_MODEL."
    );
  }

  // Try primary
  try {
    return await primaryProvider.complete(systemPrompt, userMessage);
  } catch (primaryError) {
    console.error(
      `[PCP] Primary LLM (${primaryProvider.name}) failed:`,
      primaryError
    );

    // Try fallback
    if (fallbackProvider) {
      try {
        console.error(`[PCP] Trying fallback LLM (${fallbackProvider.name})...`);
        return await fallbackProvider.complete(systemPrompt, userMessage);
      } catch (fallbackError) {
        console.error(
          `[PCP] Fallback LLM (${fallbackProvider.name}) also failed:`,
          fallbackError
        );
        throw new Error(
          `Both LLM providers failed. Primary (${primaryProvider.name}): ${primaryError}. Fallback (${fallbackProvider.name}): ${fallbackError}`
        );
      }
    }

    throw primaryError;
  }
}
