"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import ReplaceCartItemModal from "./ReplaceCartItemModal";

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
  const [pendingItem, setPendingItem] = useState<CartItem | null>(null);
  const router = useRouter();

  function addItem(next: CartItem) {
    if (item && item.deliveryDate !== next.deliveryDate) {
      setPendingItem(next);
      return;
    }
    setItem(next);
    router.push("/cart");
  }

  function confirmReplace() {
    if (!pendingItem) return;
    setItem(pendingItem);
    setPendingItem(null);
    router.push("/cart");
  }

  function cancelReplace() {
    setPendingItem(null);
  }

  return (
    <CartContext.Provider value={{ item, count: item ? 1 : 0, addItem }}>
      {children}
      {pendingItem && item && (
        <ReplaceCartItemModal
          currentItem={item}
          newItem={pendingItem}
          onConfirm={confirmReplace}
          onCancel={cancelReplace}
        />
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
