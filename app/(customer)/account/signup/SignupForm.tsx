"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { signupCustomer, type AuthState } from "@/lib/actions/customerAuthActions";
import PasswordInput from "@/app/components/PasswordInput";

const initial: AuthState = {};

function inputClass() {
  return "w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
      {children}
    </label>
  );
}

export default function SignupForm() {
  const [state, action, isPending] = useActionState(signupCustomer, initial);

  useEffect(() => {
    if (state.success) window.location.href = "/account";
  }, [state.success]);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state.message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.message}
        </div>
      )}

      <div>
        <Label>Full Name</Label>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Jane Smith"
          className={inputClass()}
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
          className={inputClass()}
        />
      </div>

      <div>
        <Label>Phone Number</Label>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+1 555 000 0000"
          className={inputClass()}
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
          className={inputClass()}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/account/login"
          className="font-medium text-neutral-900 underline underline-offset-2 hover:opacity-70"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
