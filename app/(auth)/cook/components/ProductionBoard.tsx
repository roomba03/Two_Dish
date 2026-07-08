"use client";

import { useState } from "react";
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
    paid: "border-herb/40 text-herb",
    preparing: "border-herb/40 text-herb",
    delivered: "border-herb/40 text-herb",
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
    <span
      className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${
        slot === "early" ? "border-herb/40 text-herb" : "border-warmgray/40 text-warmgray"
      }`}
    >
      {slot === "early" ? "6:30–7:30" : "7:30–8:30"}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Filter = "all" | "early" | "late";

export default function ProductionBoard({
  run,
}: {
  run: ProductionRun | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  if (!run) {
    return (
      <div className="py-32 text-center">
        <p className="tfb-eyebrow">No menu scheduled for today</p>
        <p className="mt-2 text-sm text-herb">
          Add a schedule row in Supabase to see today&apos;s orders here.
        </p>
      </div>
    );
  }

  const visibleOrders: OrderRow[] =
    filter === "all" ? run.orders : run.orders.filter((o) => o.time_slot === filter);

  const filterBtn = (value: Filter, label: string) => (
    <button
      key={value}
      onClick={() => setFilter(value)}
      className={[
        "cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-opacity",
        filter === value
          ? "bg-terracotta text-sage"
          : "text-herb hover:opacity-70",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div>
        <p className="tfb-eyebrow">Today&apos;s production run</p>
        <div className="mt-1 flex items-baseline justify-between">
          <h1 className="text-2xl text-deep-leaf">{formatDate(run.date)}</h1>
          <p className="text-sm font-medium text-herb">
            Serving today:{" "}
            <span className="font-medium text-deep-leaf">{run.dishName}</span>
          </p>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Orders" value={run.totalOrders} />
        <StatCard label="Total meals" value={run.totalMeals} />
        <StatCard label="Early window" value={run.earlyMeals} />
        <StatCard label="Late window" value={run.lateMeals} />
      </div>

      {/* ── Revenue + capacity bar ────────────────────────────────── */}
      <div className="tfb-card flex items-center justify-between px-6 py-4">
        <div>
          <p className="tfb-eyebrow">Revenue</p>
          <p className="text-xl font-medium text-deep-leaf">
            ${run.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="tfb-eyebrow">Capacity</p>
          <p className="text-xl font-medium text-deep-leaf">
            {run.totalMeals}{" "}
            <span className="text-sm font-normal text-warmgray">
              / {run.maxCapacity}
            </span>
          </p>
        </div>
      </div>

      {/* ── Orders table ──────────────────────────────────────────── */}
      <div className="tfb-card">
        <div className="flex items-center justify-between border-b border-herb/20 px-6 py-4">
          <p className="tfb-eyebrow">Orders</p>
          <div className="flex gap-1">
            {filterBtn("all", "All")}
            {filterBtn("early", "Early")}
            {filterBtn("late", "Late")}
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="py-14 text-center text-sm text-herb">
            No orders for this window.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-herb/20">
                  {[
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
                      className={`tfb-eyebrow px-6 py-3 ${
                        h === "Total" ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-herb/10">
                {visibleOrders.map((order) => (
                  <tr
                    key={order.order_number}
                    className="transition-colors hover:bg-midsage/20"
                  >
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
                    <td className="px-6 py-4 text-herb">
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
