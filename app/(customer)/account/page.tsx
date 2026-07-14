import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerFromCookie, getCustomerOrders } from "@/lib/data/account";
import SavedAddressForm from "./components/SavedAddressForm";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    authorized: "border-warmgray/40 text-warmgray",
    paid: "border-warmgray/40 text-warmgray",
    preparing: "border-warmgray/40 text-warmgray",
    delivered: "border-warmgray/40 text-warmgray",
    pending: "border-warmgray/40 text-warmgray",
    cancelled: "border-rust/40 text-rust",
    refunded: "border-rust/40 text-rust",
  };
  const cls = styles[status] ?? "border-warmgray/40 text-warmgray";
  return (
    <span className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function AccountPage() {
  const profile = await getCustomerFromCookie();
  if (!profile) redirect("/account/login");

  const orders = await getCustomerOrders(profile.id);
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="tfb-eyebrow">My account</p>
        <h1 className="mt-1 text-2xl text-deep-leaf">Welcome back, {firstName}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ── Delivery address ────────────────────────────────────── */}
        <div className="tfb-card">
          <div className="border-b border-herb px-6 py-4">
            <p className="tfb-eyebrow">Delivery address</p>
          </div>
          <div className="p-6">
            <SavedAddressForm profile={profile} />
          </div>
        </div>

        {/* ── Order history ────────────────────────────────────────── */}
        <div className="tfb-card">
          <div className="border-b border-herb px-6 py-4">
            <p className="tfb-eyebrow">Order history</p>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-medium text-warmgray">No orders yet.</p>
              <Link
                href="/menu"
                className="mt-3 inline-block text-sm font-medium text-terracotta underline underline-offset-2 hover:opacity-70"
              >
                Browse this week&apos;s menu
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-herb">
                    {["Order", "Dish", "Delivery", "Qty", "Status", "Total"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`tfb-eyebrow px-6 py-3 ${
                            h === "Total" ? "text-right" : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-herb">
                  {orders.map((order) => (
                    <tr
                      key={order.order_number}
                      className="transition-colors hover:bg-midsage/20"
                    >
                      <td className="px-6 py-4 text-xs text-warmgray">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 font-medium text-deep-leaf">
                        {order.snapshot_dish_name}
                      </td>
                      <td className="px-6 py-4 text-warmgray">
                        {formatDate(order.menu_schedule.delivery_date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-deep-leaf">
                        {order.quantity}
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
    </div>
  );
}
