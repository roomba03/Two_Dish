import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerFromCookie } from "@/lib/data/account";
import CheckoutForm from "./CheckoutForm";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const scheduleId =
    typeof params.scheduleId === "string" ? params.scheduleId : "";
  const dishName =
    typeof params.dishName === "string"
      ? decodeURIComponent(params.dishName)
      : "";
  const deliveryDate =
    typeof params.deliveryDate === "string" ? params.deliveryDate : "";
  const price =
    typeof params.price === "string" ? parseFloat(params.price) : NaN;

  if (!scheduleId || !dishName || !deliveryDate || isNaN(price) || price <= 0) {
    redirect("/menu");
  }

  // Pre-fill checkout fields from the customer's saved profile if signed in.
  const profile = await getCustomerFromCookie();
  const prefill = profile
    ? {
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        street: profile.delivery_street ?? "",
        city: profile.delivery_city ?? "",
        zip: profile.delivery_zip ?? "",
      }
    : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/menu"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          ← Back to menu
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Checkout
        </h1>
        <p className="mt-2 text-neutral-500">
          Complete your order for{" "}
          <span className="font-semibold text-neutral-800">{dishName}</span>
          {" "}on{" "}
          <span className="font-semibold text-neutral-800">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(
              (() => { const [y, m, d] = deliveryDate.split("-").map(Number); return new Date(y, m - 1, d); })()
            )}
          </span>
          . Each order covers one delivery day — return to the menu to order
          for another date.
        </p>
      </div>

      <CheckoutForm
        scheduleId={scheduleId}
        dishName={dishName}
        price={price}
        deliveryDate={deliveryDate}
        prefill={prefill}
      />
    </main>
  );
}
