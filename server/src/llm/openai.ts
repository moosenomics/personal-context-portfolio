import type { LLMProvider } from "./types.js";

export class OpenAIProvider implements LLMProvider {
  name = "openai";

  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 8192,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("OpenAI API returned no content");
    }

    return data.choices[0].message.content;
  }
}
