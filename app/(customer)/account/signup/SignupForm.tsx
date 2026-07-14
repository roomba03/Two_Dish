"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupCustomer, type AuthState } from "@/lib/actions/customerAuthActions";
import PasswordInput from "@/app/components/PasswordInput";

const initial: AuthState = {};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="tfb-label">{children}</label>;
}

export default function SignupForm() {
  const [state, action, isPending] = useActionState(signupCustomer, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
          {state.error}
        </div>
      )}

      {state.message && (
        <div className="rounded-lg border border-herb bg-midsage/30 px-4 py-3 text-sm text-warmgray">
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

      <div>
        <Label>Street address</Label>
        <input
          name="delivery_street"
          type="text"
          required
          placeholder="123 Main St"
          autoComplete="street-address"
          className="tfb-input w-full"
        />
      </div>

      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <div>
          <Label>City</Label>
          <input
            name="delivery_city"
            type="text"
            required
            placeholder="Overland Park"
            autoComplete="address-level2"
            className="tfb-input w-full"
          />
        </div>
        <div>
          <Label>ZIP</Label>
          <input
            name="delivery_zip"
            type="text"
            required
            placeholder="66221"
            maxLength={5}
            inputMode="numeric"
            autoComplete="postal-code"
            className="tfb-input w-full"
          />
        </div>
      </div>

      <button type="submit" disabled={isPending} className="tfb-btn-primary w-full mt-1">
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-warmgray">
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
