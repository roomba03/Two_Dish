"use client";

import { useState } from "react";
import Link from "next/link";
import CartIcon from "./CartIcon";
import AuthStatusLink from "./AuthStatusLink";

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

export default function HomeNav({ profileName }: { profileName: string | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="tfb-rise sticky top-0 z-50 border-b border-herb bg-sage/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className="font-heading text-xl text-deep-leaf">Two Dish</span>
          {profileName && (
            <span className="hidden md:block">
              <AuthStatusLink name={profileName} />
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {!profileName && (
            <Link
              href="/cook/login"
              className="text-sm font-medium text-warmgray transition-all hover:text-[16px] hover:opacity-70"
            >
              Staff login
            </Link>
          )}
          {!profileName && (
            <Link
              href="/account/login"
              className="text-sm font-medium text-warmgray transition-all hover:text-[16px] hover:opacity-70"
            >
              Sign in
            </Link>
          )}
          {!profileName && (
            <Link
              href="/account/signup"
              className="text-sm font-medium text-warmgray transition-all hover:text-[16px] hover:opacity-70"
            >
              Sign up
            </Link>
          )}
          <Link
            href="/menu"
            className="rounded-lg border border-terracotta px-5 py-2 text-sm font-medium text-terracotta transition-all hover:text-[16px] hover:opacity-70"
          >
            Order now
          </Link>
          <CartIcon />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-4 md:hidden">
          <CartIcon />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center text-deep-leaf transition-opacity hover:opacity-70"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-herb bg-sage px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {profileName && <AuthStatusLink name={profileName} />}
            {!profileName && (
              <Link
                href="/cook/login"
                onClick={close}
                className="text-sm font-medium text-warmgray transition-all hover:text-[16px] hover:opacity-70"
              >
                Staff login
              </Link>
            )}
            {!profileName && (
              <Link
                href="/account/login"
                onClick={close}
                className="text-sm font-medium text-warmgray transition-all hover:text-[16px] hover:opacity-70"
              >
                Sign in
              </Link>
            )}
            {!profileName && (
              <Link
                href="/account/signup"
                onClick={close}
                className="text-sm font-medium text-warmgray transition-all hover:text-[16px] hover:opacity-70"
              >
                Sign up
              </Link>
            )}
            <Link
              href="/menu"
              onClick={close}
              className="rounded-lg border border-terracotta px-5 py-2 text-center text-sm font-medium text-terracotta transition-all hover:text-[16px] hover:opacity-70"
            >
              Order now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
