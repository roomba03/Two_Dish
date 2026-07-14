"use client";

import Link from "next/link";
import { logoutCustomer } from "@/lib/actions/customerAuthActions";

export default function AccountNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-herb bg-sage">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-lg text-deep-leaf transition-opacity hover:opacity-70"
        >
          Two Dish
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/menu"
            className="text-sm font-medium text-warmgray transition-opacity hover:opacity-70"
          >
            Menu
          </Link>
          <form action={logoutCustomer}>
            <button
              type="submit"
              className="text-sm font-medium text-warmgray transition-opacity hover:opacity-70"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
