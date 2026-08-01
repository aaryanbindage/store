import { gemini, generateWithRetry } from "@/lib/ai/gemini";
import {
  fallbackProductDescription,
  fallbackStoreDescription,
  fallbackSocialContent,
  fallbackMarketingCopy,
} from "@/lib/ai/fallback-templates";

export async function generateProductDescription(params: {
  productName: string;
  features: string[];
  targetAudience?: string;
  tone?: "professional" | "casual" | "luxury" | "friendly";
}): Promise<string> {
  const { productName, features, targetAudience = "general consumers", tone = "professional" } = params;

  const prompt = `Generate a compelling, SEO-optimized product description for:

Product: ${productName}
Features: ${features.join(", ") || "not specified"}
Target Audience: ${targetAudience}
Tone: ${tone}

Requirements:
- Keep it under 150 words
- Focus on benefits, not just features
- Make it persuasive and conversion-oriented
- Include a subtle call to action
- Return only the description, no preamble or markdown`;

  try {
    return await generateWithRetry(() => gemini.generateContent(prompt));
  } catch {
    return fallbackProductDescription({ productName, features, targetAudience });
  }
}

export async function generateStoreDescription(params: {
  storeName: string;
  businessType: string;
  products?: string[];
}): Promise<string> {
  const { storeName, businessType, products = [] } = params;

  const prompt = `Generate a professional, trustworthy store description for:

Store: ${storeName}
Business Type: ${businessType}
${products.length ? `Products: ${products.join(", ")}` : ""}

Requirements:
- Professional and trustworthy tone
- Under 120 words
- Highlight what makes the store special
- Return only the description, no preamble or markdown`;

  try {
    return await generateWithRetry(() => gemini.generateContent(prompt));
  } catch {
    return fallbackStoreDescription({ storeName, businessType });
  }
}

export async function generateSocialContent(params: {
  productName: string;
  description: string;
  platform: "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok";
}): Promise<string> {
  const { productName, description, platform } = params;

  const lengthByPlatform: Record<string, number> = {
    instagram: 2200,
    facebook: 500,
    twitter: 280,
    linkedin: 700,
    tiktok: 150,
  };

  const prompt = `Generate a ${platform} post promoting this product:

Product: ${productName}
Description: ${description}

Requirements:
- Maximum ${lengthByPlatform[platform]} characters
- Match the tone typical of ${platform}
- Include a clear call to action
- Include relevant hashtags where appropriate for the platform
- Return only the post text, no preamble`;

  try {
    return await generateWithRetry(() => gemini.generateContent(prompt));
  } catch {
    return fallbackSocialContent({ productName, description, platform });
  }
}

export async function generateMarketingCopy(params: {
  productName: string;
  description: string;
}): Promise<string> {
  const { productName, description } = params;

  const prompt = `Generate email marketing copy (subject line + body) for:

Product: ${productName}
Description: ${description}

Requirements:
- Compelling subject line under 50 characters
- Conversational but professional body copy under 150 words
- Clear call to action
- Format as "Subject: ...\\n\\n<body>"`;

  try {
    return await generateWithRetry(() => gemini.generateContent(prompt));
  } catch {
    return fallbackMarketingCopy({ productName, description });
  }
}
