import Link from "next/link";
import { Suspense } from "react";

import { UserMenu } from "@/components/user-menu";
import { createClient } from "@/lib/supabase/server";

async function AuthNavInner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center rounded-md border border-stroke px-3 text-sm font-medium text-muted transition-colors hover:border-muted hover:text-fg"
      >
        Sign in
      </Link>
    );
  }

  return <UserMenu email={user.email ?? "Account"} />;
}

export function AuthNav() {
  return (
    <Suspense
      fallback={
        <span className="inline-flex h-9 w-9 rounded-md border border-stroke opacity-40" />
      }
    >
      <AuthNavInner />
    </Suspense>
  );
}
