import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        AutoStore <span className="text-primary">AI</span>
      </Link>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/pricing">Pricing</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Get started</Link>
        </Button>
      </nav>
    </header>
  );
}
