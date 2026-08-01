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
import type { Order, OrderStatus, Store } from "@/lib/types/database";

interface OrderFormProps {
  order?: Order;
  stores: Pick<Store, "id" | "name">[];
  defaultStoreId?: string;
}

export function OrderForm({ order, stores, defaultStoreId }: OrderFormProps) {
  const router = useRouter();
  const [storeId, setStoreId] = useState(order?.store_id ?? defaultStoreId ?? stores[0]?.id ?? "");
  const [customerName, setCustomerName] = useState(order?.customer_name ?? "");
  const [customerEmail, setCustomerEmail] = useState(order?.customer_email ?? "");
  const [customerPhone, setCustomerPhone] = useState(order?.customer_phone ?? "");
  const [totalAmount, setTotalAmount] = useState(order ? String(order.total_amount) : "");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "pending");
  const [line1, setLine1] = useState(order?.shipping_address?.line1 ?? "");
  const [city, setCity] = useState(order?.shipping_address?.city ?? "");
  const [state, setState] = useState(order?.shipping_address?.state ?? "");
  const [postalCode, setPostalCode] = useState(order?.shipping_address?.postal_code ?? "");
  const [country, setCountry] = useState(order?.shipping_address?.country ?? "US");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) {
      setError("Select a store for this order.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      store_id: storeId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      total_amount: Number(totalAmount) || 0,
      notes,
    };

    if (line1 && city && state && postalCode) {
      payload.shipping_address = { line1, city, state, postal_code: postalCode, country };
    }
    if (order) {
      payload.status = status;
    }

    const url = order ? `/api/orders/${order.id}` : "/api/orders";
    const method = order ? "PUT" : "POST";

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

    router.push(`/dashboard/orders/${json.order.id}`);
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

      {order && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="customerName">Customer name</Label>
        <Input
          id="customerName"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerPhone">Phone</Label>
          <Input
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="totalAmount">Total amount (USD)</Label>
        <Input
          id="totalAmount"
          type="number"
          min="0"
          step="0.01"
          required
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />
      </div>

      <fieldset className="flex flex-col gap-3 rounded-md border p-3">
        <legend className="px-1 text-xs font-medium text-muted-foreground">
          Shipping address (optional)
        </legend>
        <Input placeholder="Address line 1" value={line1} onChange={(e) => setLine1(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {!order && (
        <p className="text-xs text-muted-foreground">
          The shipping deadline is calculated automatically (2 business days processing + 1 day
          buffer) once the order is created.
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Saving…" : order ? "Save changes" : "Create order"}
      </Button>
    </form>
  );
}
