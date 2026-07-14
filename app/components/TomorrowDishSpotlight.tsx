"use client";

import DishImage from "./DishImage";
import { useAddToCart, type AddToCartParams } from "@/app/hooks/useAddToCart";

type Props = AddToCartParams & {
  description: string;
  imageUrl: string | null;
  soldOut: boolean;
  closed: boolean;
};

export default function TomorrowDishSpotlight({
  scheduleId,
  menuItemId,
  kitchenId,
  dishName,
  price,
  deliveryDate,
  description,
  imageUrl,
  soldOut,
  closed,
}: Props) {
  const addToCart = useAddToCart();
  const disabled = soldOut || closed;

  function handleClick() {
    if (disabled) return;
    addToCart({ scheduleId, menuItemId, kitchenId, dishName, price, deliveryDate });
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={disabled ? dishName : `Add ${dishName} to cart`}
      className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-herb bg-sage text-left transition-colors disabled:cursor-not-allowed"
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <span className="tfb-eyebrow">Order tomorrow&apos;s dish</span>
        <span className="text-sm font-medium text-terracotta">
          ${price.toFixed(2)}{" "}
          <span className="text-xs font-normal text-warmgray">/ meal</span>
        </span>
      </div>

      <div className="relative">
        <div className="transition-transform duration-300 group-hover:scale-[1.02]">
          <DishImage src={imageUrl} alt={dishName} className="aspect-[3/1] rounded-none" />
        </div>
        {!disabled && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-deep-leaf/0 transition-colors group-hover:bg-deep-leaf/10">
            <span className="rounded-md border border-herb bg-sage px-4 py-2 text-sm font-medium text-terracotta opacity-0 transition-opacity group-hover:opacity-100">
              Add to cart
            </span>
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-warmgray/40">
            <span className="rounded-md border border-warmgray/50 bg-sage px-3 py-1 text-sm text-warmgray">
              {soldOut ? "Sold out" : "Orders closed"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h3 className="text-xl leading-tight text-deep-leaf">{dishName}</h3>
        <p className="line-clamp-1 max-w-[50%] text-sm leading-relaxed text-warmgray">
          {description}
        </p>
      </div>
    </button>
  );
}
