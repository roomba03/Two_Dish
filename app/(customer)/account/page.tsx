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
    authorized: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    preparing: "bg-sky-50 text-sky-700 border-sky-200",
    delivered: "bg-neutral-100 text-neutral-500 border-neutral-200",
    pending: "bg-neutral-50 text-neutral-400 border-neutral-200",
    cancelled: "bg-red-50 text-red-400 border-red-200",
    refunded: "bg-red-50 text-red-500 border-red-200",
  };
  const cls =
    styles[status] ?? "bg-neutral-50 text-neutral-400 border-neutral-200";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
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
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          My Account
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
          Welcome back, {firstName}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ── Delivery address ────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Delivery Address
            </p>
          </div>
          <div className="p-6">
            <SavedAddressForm profile={profile} />
          </div>
        </div>

        {/* ── Order history ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Order History
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-medium text-neutral-500">
                No orders yet.
              </p>
              <Link
                href="/menu"
                className="mt-3 inline-block text-sm font-medium text-neutral-900 underline underline-offset-2 hover:opacity-70"
              >
                Browse this week&apos;s menu
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    {["Order", "Dish", "Delivery", "Qty", "Status", "Total"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-400 ${
                            h === "Total" ? "text-right" : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((order) => (
                    <tr
                      key={order.order_number}
                      className="transition-colors hover:bg-neutral-50/60"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        {order.snapshot_dish_name}
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {formatDate(order.menu_schedule.delivery_date)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-neutral-900">
                        {order.quantity}
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
    </div>
  );
}
