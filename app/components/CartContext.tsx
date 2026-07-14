"use client";

import { createContext, useContext, useState } from "react";

export type CartItem = {
  scheduleId: string;
  dishName: string;
  price: number;
  deliveryDate: string;
  street?: string;
  city?: string;
  zip?: string;
};

type CartContextValue = {
  item: CartItem | null;
  count: number;
  addItem: (item: CartItem) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<CartItem | null>(null);

  return (
    <CartContext.Provider
      value={{ item, count: item ? 1 : 0, addItem: setItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
