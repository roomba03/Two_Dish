"use client";

import Link from "next/link";
import { useCart } from "@/app/components/CartContext";

function CartShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen px-4">
      <Link
        href="/menu"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-warmgray transition-opacity hover:opacity-70 sm:left-6 sm:top-6"
      >
        ← Back to menu
      </Link>

      <div className="flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="font-heading text-lg text-deep-leaf transition-opacity hover:opacity-70"
            >
              Two Dish
            </Link>
            <h1 className="mt-2 text-2xl text-deep-leaf">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-warmgray">{subtitle}</p>
            )}
          </div>

          <div className="tfb-card p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <CartShell title="Your cart">
      <div className="text-center">
        <p className="text-deep-leaf">Your cart is empty.</p>
        <p className="mt-1 text-sm text-warmgray">
          Head over to the menu to find something to order.
        </p>
        <Link href="/menu" className="tfb-btn-primary mt-6 inline-block">
          Go to menu
        </Link>
      </div>
    </CartShell>
  );
}

export default function CartPage() {
  const { item } = useCart();

  if (!item) return <EmptyCart />;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(
    (() => {
      const [y, m, d] = item.deliveryDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    })()
  );

  const checkoutSearch = new URLSearchParams({
    scheduleId: item.scheduleId,
    dishName: item.dishName,
    deliveryDate: item.deliveryDate,
    price: item.price.toString(),
  });
  if (item.street) checkoutSearch.set("street", item.street);
  if (item.city) checkoutSearch.set("city", item.city);
  if (item.zip) checkoutSearch.set("zip", item.zip);

  return (
    <CartShell title="Your cart" subtitle="Review your item before checkout">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-herb bg-midsage/30 px-4 py-3">
        <div>
          <p className="font-medium text-deep-leaf">{item.dishName}</p>
          <p className="mt-0.5 text-xs text-warmgray">
            Delivery on {formattedDate}
          </p>
        </div>
        <p className="text-lg font-medium text-deep-leaf">
          ${item.price.toFixed(2)}
        </p>
      </div>

      <p className="mt-4 text-xs text-warmgray">
        Quantity and delivery time are chosen at checkout.
      </p>

      <Link
        href={`/order?${checkoutSearch.toString()}`}
        className="tfb-btn-primary mt-6 block w-full text-center"
      >
        Proceed to checkout
      </Link>
    </CartShell>
  );
}
