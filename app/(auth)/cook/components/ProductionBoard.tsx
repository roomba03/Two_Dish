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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </p>
      <p className="font-mono text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    authorized: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    preparing: "bg-sky-50 text-sky-700 border-sky-200",
    delivered: "bg-neutral-100 text-neutral-500 border-neutral-200",
    pending: "bg-neutral-50 text-neutral-400 border-neutral-200",
    refunded: "bg-red-50 text-red-500 border-red-200",
  };
  const cls =
    styles[status] ?? "bg-neutral-50 text-neutral-400 border-neutral-200";
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

function SlotPill({ slot }: { slot: "early" | "late" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        slot === "early"
          ? "bg-amber-50 text-amber-700"
          : "bg-indigo-50 text-indigo-700"
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
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          No menu scheduled for today
        </p>
        <p className="mt-2 text-sm text-neutral-400">
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
        "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
        filter === value
          ? "bg-neutral-900 text-white"
          : "text-neutral-500 hover:text-neutral-900",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Today&apos;s Production Run
        </p>
        <div className="mt-1 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {formatDate(run.date)}
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Serving today:{" "}
            <span className="font-semibold text-neutral-900">{run.dishName}</span>
          </p>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Orders" value={run.totalOrders} />
        <StatCard label="Total Meals" value={run.totalMeals} />
        <StatCard label="Early Window" value={run.earlyMeals} />
        <StatCard label="Late Window" value={run.lateMeals} />
      </div>

      {/* ── Revenue + capacity bar ────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Revenue
          </p>
          <p className="font-mono text-xl font-bold text-neutral-900">
            ${run.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Capacity
          </p>
          <p className="font-mono text-xl font-bold text-neutral-900">
            {run.totalMeals}{" "}
            <span className="text-sm font-normal text-neutral-400">
              / {run.maxCapacity}
            </span>
          </p>
        </div>
      </div>

      {/* ── Orders table ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Orders
          </p>
          <div className="flex gap-1">
            {filterBtn("all", "All")}
            {filterBtn("early", "Early")}
            {filterBtn("late", "Late")}
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="py-14 text-center text-sm text-neutral-400">
            No orders for this window.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
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
                      className={`px-6 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-400 ${
                        h === "Total" ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {visibleOrders.map((order) => (
                  <tr
                    key={order.order_number}
                    className="transition-colors hover:bg-neutral-50/60"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      <p>{order.delivery_street}</p>
                      <p className="text-xs text-neutral-400">
                        {order.delivery_city}, {order.delivery_zip}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-neutral-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <SlotPill slot={order.time_slot} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-neutral-900">
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
