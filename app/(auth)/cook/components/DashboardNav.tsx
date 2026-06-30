"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutCook } from "@/lib/actions/authActions";

export default function DashboardNav() {
  const pathname = usePathname();

  const linkClass = (href: string) => {
    const isActive =
      href === "/cook" ? pathname === href : pathname.startsWith(href);
    return [
      "text-sm font-medium transition-colors",
      isActive
        ? "text-neutral-900 underline underline-offset-4 decoration-neutral-900"
        : "text-neutral-500 hover:text-neutral-900",
    ].join(" ");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Two Dish
        </span>

        <nav className="flex items-center gap-8">
          <Link href="/cook" className={linkClass("/cook")}>
            Today&apos;s Run
          </Link>
          <Link href="/cook/menu" className={linkClass("/cook/menu")}>
            Menu
          </Link>
          <Link href="/cook/schedule" className={linkClass("/cook/schedule")}>
            Schedule
          </Link>
          <Link
            href="/cook/ingredients"
            className={linkClass("/cook/ingredients")}
          >
            Ingredients
          </Link>
          <Link href="/cook/zone" className={linkClass("/cook/zone")}>
            Zone
          </Link>
        </nav>

        <form action={logoutCook}>
          <button
            type="submit"
            className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
