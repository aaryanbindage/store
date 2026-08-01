"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
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
import { Sparkles, Upload } from "lucide-react";
import type { Product, Store } from "@/lib/types/database";

interface ProductFormProps {
  product?: Product;
  stores: Pick<Store, "id" | "name">[];
  defaultStoreId?: string;
}

export function ProductForm({ product, stores, defaultStoreId }: ProductFormProps) {
  const router = useRouter();
  const [storeId, setStoreId] = useState(product?.store_id ?? defaultStoreId ?? stores[0]?.id ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const path = `${storeId || "unassigned"}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleGenerateDescription() {
    if (!name) {
      setError("Enter a product name first so the AI has something to work with.");
      return;
    }
    setGenerating(true);
    setError(null);

    const features = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/ai/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: name, features }),
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
    if (!storeId) {
      setError("Select a store for this product.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      store_id: storeId,
      name,
      description,
      price: Number(price) || 0,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      image_url: imageUrl,
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

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

    router.push(`/dashboard/products/${json.product.id}`);
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
        <Label htmlFor="store">Store</Label>
        <Select value={storeId} onValueChange={setStoreId} disabled={stores.length === 0}>
          <SelectTrigger id="store">
            <SelectValue placeholder="Select a store" />
          </SelectTrigger>
          <SelectContent>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="price">Price (USD)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Category (optional)</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Features / tags (comma separated)</Label>
        <Input
          id="tags"
          placeholder="lightweight, waterproof, adjustable"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="image">Product image (optional)</Label>
        <div className="flex items-center gap-3">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Product preview"
              width={56}
              height={56}
              className="size-14 rounded-md border object-cover"
              unoptimized
            />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <Upload className="size-4" />
            {uploading ? "Uploading…" : "Upload image"}
            <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateDescription}
            disabled={generating}
            className="h-auto gap-1 px-2 py-1 text-xs"
          >
            <Sparkles className="size-3" />
            {generating ? "Generating…" : "Generate with AI"}
          </Button>
        </div>
        <Textarea
          id="description"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading || uploading} className="w-fit">
        {loading ? "Saving…" : product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
