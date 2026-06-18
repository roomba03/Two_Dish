"use client";

import { useRouter } from "next/navigation";

type Props = {
  scheduleId: string;
  menuItemId: string;
  kitchenId: string;
  dishName: string;
  price: number;
  deliveryDate: string;
};

export default function AddToCartButton({
  scheduleId,
  menuItemId,
  kitchenId,
  dishName,
  price,
  deliveryDate,
}: Props) {
  const router = useRouter();

  function handleClick() {
    const params = new URLSearchParams({
      scheduleId,
      menuItemId,
      kitchenId,
      dishName,
      price: price.toString(),
      deliveryDate,
    });
    router.push(`/order?${params.toString()}`);
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 active:scale-95"
    >
      Add {dishName} to Cart
    </button>
  );
}
