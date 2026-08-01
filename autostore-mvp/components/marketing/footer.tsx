import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 py-10 text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
        <p>© {new Date().getFullYear()} AutoStore AI. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
