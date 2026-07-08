"use client";

import { useActionState } from "react";
import { loginCook, type LoginState } from "@/lib/actions/authActions";
import PasswordInput from "@/app/components/PasswordInput";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginCook, initialState);

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
          placeholder="family@example.com"
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
    </form>
  );
}
