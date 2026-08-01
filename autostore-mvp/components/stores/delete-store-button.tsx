"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteStoreButton({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this store and all of its products/orders? This can't be undone.")) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/stores/${storeId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/stores");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="size-4" />
      {loading ? "Deleting…" : "Delete store"}
    </Button>
  );
}
