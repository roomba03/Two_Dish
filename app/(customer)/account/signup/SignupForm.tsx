"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { signupCustomer, type AuthState } from "@/lib/actions/customerAuthActions";
import PasswordInput from "@/app/components/PasswordInput";

const initial: AuthState = {};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="tfb-label">{children}</label>;
}

export default function SignupForm() {
  const [state, action, isPending] = useActionState(signupCustomer, initial);

  useEffect(() => {
    if (state.success) window.location.href = "/account";
  }, [state.success]);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
          {state.error}
        </div>
      )}

      {state.message && (
        <div className="rounded-lg border border-herb/30 bg-midsage/30 px-4 py-3 text-sm text-herb">
          {state.message}
        </div>
      )}

      <div>
        <Label>Full name</Label>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Jane Smith"
          className="tfb-input w-full"
        />
      </div>

      <div>
        <Label>Email</Label>
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
        <Label>Phone number</Label>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+1 555 000 0000"
          className="tfb-input w-full"
        />
      </div>

      <div>
        <Label>Password</Label>
        <PasswordInput
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="tfb-input w-full"
        />
      </div>

      <button type="submit" disabled={isPending} className="tfb-btn-primary w-full mt-1">
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-herb">
        Already have an account?{" "}
        <Link
          href="/account/login"
          className="font-medium text-terracotta underline underline-offset-2 hover:opacity-70"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
