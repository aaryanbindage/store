import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 p-6">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        AutoStore <span className="text-primary">AI</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
