"use client";

import { useActionState } from "react";
import { loginCook, type LoginState } from "@/lib/actions/authActions";
import PasswordInput from "@/app/components/PasswordInput";

const initialState: LoginState = {};

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 outline-none transition-colors",
    hasError
      ? "border-red-300 bg-red-50 focus:ring-1 focus:ring-red-400"
      : "border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900",
  ].join(" ");
}

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginCook, initialState);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
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
          placeholder="family@example.com"
          className={inputClass(false)}
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
          className={inputClass(false)}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
