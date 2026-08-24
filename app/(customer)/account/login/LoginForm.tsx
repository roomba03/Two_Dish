"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginCustomer, type AuthState } from "@/lib/actions/customerAuthActions";
import PasswordInput from "@/app/components/PasswordInput";

const initial: AuthState = {};

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginCustomer, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
          {state.error}
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

      <button type="submit" disabled={isPending} className="tfb-btn-primary w-full mt-1">
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-warmgray">
        Don&apos;t have an account?{" "}
        <Link
          href="/account/signup"
          className="font-medium text-warmgray underline underline-offset-2 hover:opacity-70"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
