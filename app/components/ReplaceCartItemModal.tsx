"use client";

import { useEffect } from "react";
import type { CartItem } from "./CartContext";

function formatDeliveryDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

export default function ReplaceCartItemModal({
  currentItem,
  newItem,
  onConfirm,
  onCancel,
}: {
  currentItem: CartItem;
  newItem: CartItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-deep-leaf/50 px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="replace-cart-item-title"
        aria-describedby="replace-cart-item-description"
        className="tfb-card w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="replace-cart-item-title" className="text-lg text-deep-leaf">
          Replace item in cart?
        </h2>
        <p
          id="replace-cart-item-description"
          className="mt-2 text-sm leading-relaxed text-warmgray"
        >
          Your cart already has{" "}
          <span className="font-medium text-deep-leaf">
            {currentItem.dishName}
          </span>{" "}
          for {formatDeliveryDate(currentItem.deliveryDate)}. Adding{" "}
          <span className="font-medium text-deep-leaf">
            {newItem.dishName}
          </span>{" "}
          for {formatDeliveryDate(newItem.deliveryDate)} will replace it —
          each order covers one delivery day.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="tfb-btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="tfb-btn-primary flex-1"
          >
            Replace item
          </button>
        </div>
      </div>
    </div>
  );
}
