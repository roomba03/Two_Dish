"use client";

import type { MouseEvent } from "react";
import { useAddToCart, type AddToCartParams } from "@/app/hooks/useAddToCart";

export default function AddToCartHoverButton(props: AddToCartParams) {
  const addToCart = useAddToCart();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(props);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Add ${props.dishName} to cart`}
      className="absolute inset-0 flex items-center justify-center bg-deep-leaf/10 opacity-100 transition-colors md:bg-deep-leaf/0 md:opacity-0 md:pointer-events-none md:focus-visible:pointer-events-auto md:focus-visible:opacity-100 md:group-hover:pointer-events-auto md:group-hover:bg-deep-leaf/10 md:group-hover:opacity-100"
    >
      <span className="rounded-md border border-herb bg-sage px-4 py-2 text-sm font-medium text-terracotta">
        Add to cart
      </span>
    </button>
  );
}
