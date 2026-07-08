"use client";

import { useAddToCart, type AddToCartParams } from "@/app/hooks/useAddToCart";

type Props = AddToCartParams;

export default function AddToCartButton(props: Props) {
  const addToCart = useAddToCart();
  const { dishName } = props;

  function handleClick() {
    addToCart(props);
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-lg bg-terracotta py-3 text-sm font-medium text-sage transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta active:scale-[0.98]"
    >
      Add {dishName} to cart
    </button>
  );
}
