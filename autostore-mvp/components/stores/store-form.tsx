"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Store, StorePlatform } from "@/lib/types/database";
import { Sparkles } from "lucide-react";

interface StoreFormProps {
  store?: Store;
}

export function StoreForm({ store }: StoreFormProps) {
  const router = useRouter();
  const [name, setName] = useState(store?.name ?? "");
  const [platform, setPlatform] = useState<StorePlatform>(store?.platform ?? "other");
  const [description, setDescription] = useState(store?.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(store?.website_url ?? "");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!name) {
      setError("Enter a store name first so the AI has something to work with.");
      return;
    }
    setGenerating(true);
    setError(null);

    const res = await fetch("/api/ai/generate-store-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeName: name, businessType: platform }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Couldn't generate a description right now.");
    } else {
      setDescription(json.description);
    }
    setGenerating(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { name, platform, description, website_url: websiteUrl };
    const url = store ? `/api/stores/${store.id}` : "/api/stores";
    const method = store ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/stores/${json.store.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Store name</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="platform">Platform</Label>
        <Select value={platform} onValueChange={(v) => setPlatform(v as StorePlatform)}>
          <SelectTrigger id="platform">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shopify">Shopify</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="etsy">Etsy</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="websiteUrl">Website URL (optional)</Label>
        <Input
          id="websiteUrl"
          type="url"
          placeholder="https://"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description (optional)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="h-auto gap-1 px-2 py-1 text-xs"
          >
            <Sparkles className="size-3" />
            {generating ? "Generating…" : "Generate with AI"}
          </Button>
        </div>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Saving…" : store ? "Save changes" : "Create store"}
      </Button>
    </form>
  );
}
