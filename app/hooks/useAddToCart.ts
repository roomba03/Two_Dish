"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartContext";

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
  const { addItem } = useCart();

  return (params: AddToCartParams) => {
    addItem({
      scheduleId: params.scheduleId,
      dishName: params.dishName,
      price: params.price,
      deliveryDate: params.deliveryDate,
      street: params.street,
      city: params.city,
      zip: params.zip,
    });
    router.push("/cart");
  };
}
