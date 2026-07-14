"use client";

import { useMemo, useState } from "react";
import type { ProductionRun, OrderRow } from "@/lib/data/cook";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-CA").format(new Date(y, m - 1, d + days));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="tfb-card p-5">
      <p className="tfb-eyebrow mb-2">{label}</p>
      <p className="text-3xl font-medium text-deep-leaf">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    authorized: "border-warmgray/40 text-warmgray",
    paid: "border-warmgray/40 text-warmgray",
    preparing: "border-warmgray/40 text-warmgray",
    delivered: "border-warmgray/40 text-warmgray",
    pending: "border-warmgray/40 text-warmgray",
    refunded: "border-rust/40 text-rust",
  };
  const cls = styles[status] ?? "border-warmgray/40 text-warmgray";
  return (
    <span className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function SlotPill({ slot }: { slot: "early" | "late" }) {
  return (
    <span className="rounded-md border border-warmgray/40 px-2.5 py-0.5 text-xs font-medium text-warmgray">
      {slot === "early" ? "6:30–7:30" : "7:30–8:30"}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type SlotFilter = "all" | "early" | "late";
type RangeFilter = "week" | "today" | "3" | "allWithOrders" | "custom";

const RANGE_LABELS: Record<RangeFilter, string> = {
  today: "Today",
  "3": "Next 3 days",
  week: "This week",
  allWithOrders: "All upcoming orders",
  custom: "Custom range",
};

export default function ProductionBoard({
  run,
  today,
}: {
  run: ProductionRun | null;
  today: string;
}) {
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("week");
  const [slotFilter, setSlotFilter] = useState<SlotFilter>("all");
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(addDays(today, 6));

  // The last delivery date that actually has an order — the upper bound for
  // the "All with orders" filter.
  const lastOrderDate = useMemo(() => {
    if (!run || run.orders.length === 0) return today;
    return run.orders.reduce(
      (max, o) => (o.delivery_date > max ? o.delivery_date : max),
      today
    );
  }, [run, today]);

  const rangeStart = rangeFilter === "custom" ? customStart || today : today;

  const rangeEnd = useMemo(() => {
    if (!run) return today;
    switch (rangeFilter) {
      case "today":
        return today;
      case "3":
        return addDays(today, 2);
      case "allWithOrders":
        return lastOrderDate;
      case "custom":
        return customEnd || today;
      case "week":
      default:
        return addDays(today, 6);
    }
  }, [rangeFilter, today, run, lastOrderDate, customEnd]);

  const visibleDays = useMemo(() => {
    if (!run) return [];
    return run.days.filter((d) => d.date >= rangeStart && d.date <= rangeEnd);
  }, [run, rangeStart, rangeEnd]);

  const rangeOrders = useMemo(() => {
    if (!run) return [];
    return run.orders.filter(
      (o) => o.delivery_date >= rangeStart && o.delivery_date <= rangeEnd
    );
  }, [run, rangeStart, rangeEnd]);

  const visibleOrders: OrderRow[] =
    slotFilter === "all"
      ? rangeOrders
      : rangeOrders.filter((o) => o.time_slot === slotFilter);

  const dishSubtotals = useMemo(() => {
    const totals = new Map<string, { quantity: number; orders: number }>();
    for (const o of visibleOrders) {
      const entry = totals.get(o.dish_name) ?? { quantity: 0, orders: 0 };
      entry.quantity += o.quantity;
      entry.orders += 1;
      totals.set(o.dish_name, entry);
    }
    return Array.from(totals.entries())
      .map(([dishName, totals]) => ({ dishName, ...totals }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [visibleOrders]);

  if (!run) {
    return (
      <div className="py-32 text-center">
        <p className="tfb-eyebrow">No production data available</p>
        <p className="mt-2 text-sm text-warmgray">
          Add a schedule row in Supabase to see orders here.
        </p>
      </div>
    );
  }

  const stats = {
    totalOrders: visibleOrders.length,
    totalMeals: visibleOrders.reduce((s, o) => s + o.quantity, 0),
    earlyMeals: visibleOrders
      .filter((o) => o.time_slot === "early")
      .reduce((s, o) => s + o.quantity, 0),
    lateMeals: visibleOrders
      .filter((o) => o.time_slot === "late")
      .reduce((s, o) => s + o.quantity, 0),
    totalRevenue: visibleOrders.reduce((s, o) => s + Number(o.total_price), 0),
    totalCapacity: visibleDays.reduce((s, d) => s + d.maxCapacity, 0),
  };

  const rangeBtn = (value: RangeFilter) => (
    <button
      key={value}
      onClick={() => setRangeFilter(value)}
      className={[
        "cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-opacity",
        rangeFilter === value
          ? "bg-terracotta text-sage"
          : "text-warmgray hover:opacity-70",
      ].join(" ")}
    >
      {RANGE_LABELS[value]}
    </button>
  );

  const slotBtn = (value: SlotFilter, label: string) => (
    <button
      key={value}
      onClick={() => setSlotFilter(value)}
      className={[
        "cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-opacity",
        slotFilter === value
          ? "bg-terracotta text-sage"
          : "text-warmgray hover:opacity-70",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div>
        <p className="tfb-eyebrow">Production run</p>
        <div className="mt-1 flex items-baseline justify-between">
          <h1 className="text-2xl text-deep-leaf">
            {rangeStart === rangeEnd
              ? formatDate(rangeStart)
              : `${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}`}
          </h1>
          <p className="text-sm font-medium text-warmgray">
            {visibleDays.length} day{visibleDays.length === 1 ? "" : "s"}{" "}
            scheduled
          </p>
        </div>
      </div>

      {/* ── Range filter ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {rangeBtn("today")}
          {rangeBtn("3")}
          {rangeBtn("week")}
          {rangeBtn("allWithOrders")}
          {rangeBtn("custom")}
        </div>

        {rangeFilter === "custom" && (
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={customStart}
              min={today}
              max={run?.endDate ?? undefined}
              onChange={(e) => {
                const value = e.target.value;
                setCustomStart(value);
                if (value > customEnd) setCustomEnd(value);
              }}
              className="tfb-input cursor-pointer py-1.5"
            />
            <span className="text-warmgray">to</span>
            <input
              type="date"
              value={customEnd}
              min={customStart || today}
              max={run?.endDate ?? undefined}
              onChange={(e) => {
                const value = e.target.value;
                setCustomEnd(value);
                if (value < customStart) setCustomStart(value);
              }}
              className="tfb-input cursor-pointer py-1.5"
            />
          </div>
        )}
      </div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Orders" value={stats.totalOrders} />
        <StatCard label="Total meals" value={stats.totalMeals} />
        <StatCard label="Early window" value={stats.earlyMeals} />
        <StatCard label="Late window" value={stats.lateMeals} />
      </div>

      {/* ── Revenue + capacity bar ────────────────────────────────── */}
      <div className="tfb-card flex items-center justify-between px-6 py-4">
        <div>
          <p className="tfb-eyebrow">Revenue</p>
          <p className="text-xl font-medium text-deep-leaf">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="tfb-eyebrow">Capacity</p>
          <p className="text-xl font-medium text-deep-leaf">
            {stats.totalMeals}{" "}
            <span className="text-sm font-normal text-warmgray">
              / {stats.totalCapacity}
            </span>
          </p>
        </div>
      </div>

      {/* ── Dish subtotals ────────────────────────────────────────── */}
      {dishSubtotals.length > 0 && (
        <div className="tfb-card">
          <div className="border-b border-herb px-6 py-4">
            <p className="tfb-eyebrow">Meals needed by dish</p>
          </div>
          <div className="divide-y divide-herb">
            {dishSubtotals.map((d) => (
              <div
                key={d.dishName}
                className="flex items-center justify-between px-6 py-3 text-sm"
              >
                <span className="font-medium text-deep-leaf">{d.dishName}</span>
                <span className="text-warmgray">
                  <span className="font-medium text-deep-leaf">
                    {d.quantity}
                  </span>{" "}
                  meal{d.quantity === 1 ? "" : "s"}
                  <span className="ml-2 text-xs">
                    ({d.orders} order{d.orders === 1 ? "" : "s"})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Orders table ──────────────────────────────────────────── */}
      <div className="tfb-card">
        <div className="flex items-center justify-between border-b border-herb px-6 py-4">
          <p className="tfb-eyebrow">Orders</p>
          <div className="flex gap-1">
            {slotBtn("all", "All")}
            {slotBtn("early", "Early")}
            {slotBtn("late", "Late")}
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="py-14 text-center text-sm text-warmgray">
            No orders for this window.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-herb">
                  {[
                    "Date",
                    "Dish",
                    "Order",
                    "Customer",
                    "Address",
                    "Qty",
                    "Window",
                    "Status",
                    "Total",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`tfb-eyebrow px-6 py-3 whitespace-nowrap ${
                        h === "Total" ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-herb">
                {visibleOrders.map((order) => (
                  <tr
                    key={order.order_number}
                    className="transition-colors hover:bg-midsage/20"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-warmgray">
                      {formatShortDate(order.delivery_date)}
                    </td>
                    <td className="px-6 py-4 text-deep-leaf">
                      {order.dish_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-warmgray">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-deep-leaf">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-warmgray">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-warmgray">
                      <p>{order.delivery_street}</p>
                      <p className="text-xs text-warmgray">
                        {order.delivery_city}, {order.delivery_zip}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-deep-leaf">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <SlotPill slot={order.time_slot} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-deep-leaf">
                      ${Number(order.total_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
