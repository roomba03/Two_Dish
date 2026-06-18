"use client";

import Link from "next/link";
import { useState } from "react";
import PasswordInput from "@/app/components/PasswordInput";

function inputClass() {
  return "w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
}

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
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Email
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass()}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Password
        </label>
        <PasswordInput
          name="password"
          autoComplete="current-password"
          required
          className={inputClass()}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/account/signup"
          className="font-medium text-neutral-900 underline underline-offset-2 hover:opacity-70"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
