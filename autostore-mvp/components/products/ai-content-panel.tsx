"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy, Check } from "lucide-react";

interface AIContentPanelProps {
  productName: string;
  description: string;
}

const platforms = ["instagram", "facebook", "twitter", "linkedin", "tiktok"] as const;

export function AIContentPanel({ productName, description }: AIContentPanelProps) {
  const [marketing, setMarketing] = useState("");
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("instagram");
  const [social, setSocial] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  async function generateMarketing() {
    setMarketingLoading(true);
    const res = await fetch("/api/ai/generate-marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, description }),
    });
    const json = await res.json();
    if (res.ok) setMarketing(json.content);
    setMarketingLoading(false);
  }

  async function generateSocial() {
    setSocialLoading(true);
    const res = await fetch("/api/ai/generate-social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, description, platform }),
    });
    const json = await res.json();
    if (res.ok) setSocial(json.content);
    setSocialLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI marketing content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="marketing">
          <TabsList>
            <TabsTrigger value="marketing">Email marketing</TabsTrigger>
            <TabsTrigger value="social">Social media</TabsTrigger>
          </TabsList>

          <TabsContent value="marketing" className="flex flex-col gap-3 pt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={generateMarketing}
              disabled={marketingLoading}
              className="w-fit gap-1"
            >
              <Sparkles className="size-3.5" />
              {marketingLoading ? "Generating…" : "Generate email copy"}
            </Button>
            {marketing && (
              <div className="relative rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                <button
                  type="button"
                  onClick={() => copy(marketing, "marketing")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  {copied === "marketing" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
                {marketing}
              </div>
            )}
          </TabsContent>

          <TabsContent value="social" className="flex flex-col gap-3 pt-3">
            <div className="flex items-center gap-2">
              <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={generateSocial}
                disabled={socialLoading}
                className="gap-1"
              >
                <Sparkles className="size-3.5" />
                {socialLoading ? "Generating…" : "Generate post"}
              </Button>
            </div>
            {social && (
              <div className="relative rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                <button
                  type="button"
                  onClick={() => copy(social, "social")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  {copied === "social" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
                {social}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
