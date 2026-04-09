import type { LLMProvider } from "./types.js";

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";

  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Anthropic API error ${response.status}: ${body}`
      );
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text?: string }>;
    };

    const textBlock = data.content.find((b) => b.type === "text");
    if (!textBlock?.text) {
      throw new Error("Anthropic API returned no text content");
    }

    return textBlock.text;
  }
}
