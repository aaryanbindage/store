import { StoreForm } from "@/components/stores/store-form";

export default function NewStorePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New store</h1>
      <StoreForm />
    </div>
  );
}
