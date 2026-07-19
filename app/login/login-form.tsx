"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { BrandWordmark } from "@/components/brand-wordmark";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  showPassword,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  showPassword: boolean;
  onToggleShow: () => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="relative block">
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-md border border-stroke bg-surface py-2 pr-11 pl-3 text-fg outline-none focus:border-muted"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-fg"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          <EyeIcon open={showPassword} />
        </button>
      </span>
    </label>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/deals";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(urlError);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    if (mode === "signup" && password !== passwordConfirm) {
      setMessage("Passwords do not match.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage("Check your email for the magic link.");
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage(
          "Account created. Check your email to confirm, then sign in.",
        );
        setMode("signin");
        setPasswordConfirm("");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.replace(next.startsWith("/") ? next : "/deals");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4">
        <Link href="/deals" className="w-fit">
          <BrandWordmark size="sm" />
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Sign in
        </h1>
        <p className="text-sm text-muted">
          Email account for Broke Gamer. Wishlist comes next.
        </p>
      </div>

      <div className="flex gap-2 text-sm">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
            ["magic", "Magic link"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setMessage(null);
              setPasswordConfirm("");
            }}
            className={
              mode === id
                ? "rounded-md bg-accent px-3 py-1.5 font-medium text-fg"
                : "rounded-md border border-stroke px-3 py-1.5 text-muted hover:text-fg"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-md border border-stroke bg-surface px-3 text-fg outline-none focus:border-muted"
          />
        </label>

        {mode !== "magic" ? (
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            showPassword={showPassword}
            onToggleShow={() => setShowPassword((value) => !value)}
          />
        ) : null}

        {mode === "signup" ? (
          <PasswordField
            label="Repeat password"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            autoComplete="new-password"
            showPassword={showPassword}
            onToggleShow={() => setShowPassword((value) => !value)}
          />
        ) : null}

        {message ? (
          <p className="rounded-md border border-stroke bg-surface px-3 py-2 text-sm text-muted">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending
            ? "Working…"
            : mode === "magic"
              ? "Send magic link"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
        </button>
      </form>

      <Link href="/deals" className="text-sm text-muted hover:text-fg">
        ← Back to deals
      </Link>
    </div>
  );
}
