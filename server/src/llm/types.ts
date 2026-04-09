export interface LLMProvider {
  name: string;
  complete(systemPrompt: string, userMessage: string): Promise<string>;
}

export interface NormalizationUpdate {
  file: string;
  section: string | null;
  action: "replace" | "append" | "add";
  content: string;
  reason: string;
  suggested_visibility?: {
    include?: string[];
    exclude?: string[];
    reason: string;
  };
}

export interface SkippedObservation {
  observation: string;
  reason: string;
}

export interface NormalizationResponse {
  updates: NormalizationUpdate[];
  skipped_observations: SkippedObservation[];
}
