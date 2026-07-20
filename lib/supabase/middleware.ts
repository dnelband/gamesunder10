import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Session cookie refresh for matched requests.
 *
 * File name says "middleware" because that was the Next.js 14/15 convention.
 * In this app it is only imported from the root `proxy.ts` (Next.js 16 rename
 * of middleware). Do not add a root `middleware.ts` — keep using `proxy.ts`.
 *
 * Do not use getSession() here for auth decisions — getClaims() validates the JWT.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  // Refreshes the session if expired — required for Server Components.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
