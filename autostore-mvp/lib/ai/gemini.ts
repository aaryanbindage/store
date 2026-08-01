import { GoogleGenerativeAI } from "@google/generative-ai";

// Free-tier gemini-1.5-flash allows ~15 requests/minute; space calls out so a burst
// of AI-generation clicks doesn't blow through the limit in one dashboard session.
const RATE_LIMIT_DELAY_MS = 4000;

class GeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private lastRequestTime = 0;

  private getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    if (!this.client) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  private async rateLimitDelay() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < RATE_LIMIT_DELAY_MS) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  async generateContent(prompt: string): Promise<string> {
    await this.rateLimitDelay();
    const model = this.getClient().getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export const gemini = new GeminiClient();

export async function generateWithRetry<T>(
  generator: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generator();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
