"use client";

import Link from "next/link";
import { useState } from "react";
import PasswordInput from "@/app/components/PasswordInput";

export default function LoginForm({ error }: { error?: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      method="POST"
      action="/api/auth/customer-login"
      onSubmit={() => setPending(true)}
      className="flex flex-col gap-5"
    >
      {error && (
        <div className="rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
          {error}
        </div>
      )}

      <div>
        <label className="tfb-label">Email</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="tfb-input w-full"
        />
      </div>

      <div>
        <label className="tfb-label">Password</label>
        <PasswordInput
          name="password"
          autoComplete="current-password"
          required
          className="tfb-input w-full"
        />
      </div>

      <button type="submit" disabled={pending} className="tfb-btn-primary w-full mt-1">
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-warmgray">
        Don&apos;t have an account?{" "}
        <Link
          href="/account/signup"
          className="font-medium text-terracotta underline underline-offset-2 hover:opacity-70"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
