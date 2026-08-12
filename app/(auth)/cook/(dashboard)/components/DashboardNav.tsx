"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutCook } from "@/lib/actions/authActions";

const LINKS = [
  { href: "/cook", label: "Today's run" },
  { href: "/cook/menu", label: "Menu" },
  { href: "/cook/schedule", label: "Schedule" },
  { href: "/cook/ingredients", label: "Ingredients" },
  { href: "/cook/zone", label: "Zone" },
];

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 6h14M3 10h14M3 14h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const linkClass = (href: string) => {
    const isActive =
      href === "/cook" ? pathname === href : pathname.startsWith(href);
    return [
      "text-sm font-medium transition-opacity",
      isActive
        ? "text-terracotta underline underline-offset-4 decoration-terracotta"
        : "text-warmgray hover:opacity-70",
    ].join(" ");
  };

  return (
    <header className="sticky top-0 z-[1100] border-b border-herb bg-sage">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-lg text-deep-leaf transition-opacity hover:opacity-70"
        >
          Two Dish
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
        </nav>

        <form action={logoutCook} className="hidden md:block">
          <button
            type="submit"
            className="text-sm font-medium text-warmgray transition-opacity hover:opacity-70"
          >
            Sign out
          </button>
        </form>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center text-deep-leaf transition-opacity hover:opacity-70 md:hidden"
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-herb bg-sage px-4 py-5 sm:px-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={linkClass(href)}
              >
                {label}
              </Link>
            ))}
            <form action={logoutCook}>
              <button
                type="submit"
                className="text-sm font-medium text-warmgray transition-opacity hover:opacity-70"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
