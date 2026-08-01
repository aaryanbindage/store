function fill(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => params[key] ?? match);
}

export function fallbackProductDescription(params: {
  productName: string;
  features: string[];
  targetAudience?: string;
}): string {
  const { productName, features, targetAudience = "customers like you" } = params;
  return fill(
    "Introducing {productName} — designed for {targetAudience}. Featuring {features}, " +
      "it delivers reliable quality and everyday value. Add it to your cart and see the difference for yourself.",
    { productName, targetAudience, features: features.join(", ") || "thoughtful design" }
  );
}

export function fallbackStoreDescription(params: {
  storeName: string;
  businessType: string;
}): string {
  const { storeName, businessType } = params;
  return fill(
    "{storeName} is a {businessType} store built around quality and customer satisfaction. " +
      "We hand-pick every product we carry and stand behind it — thanks for shopping with us.",
    { storeName, businessType }
  );
}

const socialTemplates: Record<string, string> = {
  instagram: "✨ Meet {productName} ✨\n\n{description}\n\n🛍️ Link in bio",
  facebook: "We're excited to share {productName}!\n\n{description}\n\nShop today.",
  twitter: "🚀 New: {productName}\n\n{description}",
  linkedin:
    "Excited to introduce {productName} — {description} Reach out to learn how it can help your team.",
  tiktok: "🔥 {productName} just dropped 🔥\n\n{description}",
};

export function fallbackSocialContent(params: {
  productName: string;
  description: string;
  platform: string;
}): string {
  const template = socialTemplates[params.platform] ?? socialTemplates.facebook;
  return fill(template, params);
}

export function fallbackMarketingCopy(params: { productName: string; description: string }): string {
  return fill(
    "Subject: Introducing {productName}\n\n{description}\n\nShop now and see what everyone's talking about.",
    params
  );
}
