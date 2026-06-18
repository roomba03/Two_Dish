"use client";

import Link from "next/link";
import { logoutCustomer } from "@/lib/actions/customerAuthActions";

export default function AccountNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[var(--background)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400 transition-opacity hover:opacity-60"
        >
          Two Dish
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/menu"
            className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            Menu
          </Link>
          <form action={logoutCustomer}>
            <button
              type="submit"
              className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-900"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
