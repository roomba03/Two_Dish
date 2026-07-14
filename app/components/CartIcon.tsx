"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartIcon() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative inline-flex transition-opacity hover:opacity-70"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="text-deep-leaf"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-medium text-sage">
          {count}
        </span>
      )}
    </Link>
  );
}
