"use client";

import { useRouter } from "next/navigation";

export type AddToCartParams = {
  scheduleId: string;
  menuItemId: string;
  kitchenId: string;
  dishName: string;
  price: number;
  deliveryDate: string;
  street?: string;
  city?: string;
  zip?: string;
};

export function useAddToCart() {
  const router = useRouter();

  return (params: AddToCartParams) => {
    const search = new URLSearchParams({
      scheduleId: params.scheduleId,
      menuItemId: params.menuItemId,
      kitchenId: params.kitchenId,
      dishName: params.dishName,
      price: params.price.toString(),
      deliveryDate: params.deliveryDate,
    });
    if (params.street) search.set("street", params.street);
    if (params.city) search.set("city", params.city);
    if (params.zip) search.set("zip", params.zip);
    router.push(`/order?${search.toString()}`);
  };
}
