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

  // Address carried forward from the delivery-zone checker, if the customer
  // just verified their address is within the delivery area.
  const checkedStreet =
    typeof params.street === "string" ? decodeURIComponent(params.street) : "";
  const checkedCity =
    typeof params.city === "string" ? decodeURIComponent(params.city) : "";
  const checkedZip =
    typeof params.zip === "string" ? decodeURIComponent(params.zip) : "";

  // Pre-fill checkout fields from the customer's saved profile if signed in,
  // preferring the address just checked for delivery over the saved one.
  const profile = await getCustomerFromCookie();
  const prefill =
    profile || checkedStreet || checkedCity || checkedZip
      ? {
          name: profile?.name ?? "",
          phone: profile?.phone ?? "",
          email: profile?.email ?? "",
          street: checkedStreet || profile?.delivery_street || "",
          city: checkedCity || profile?.delivery_city || "",
          zip: checkedZip || profile?.delivery_zip || "",
        }
      : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/menu"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-herb transition-opacity hover:opacity-70"
        >
          ← Back to menu
        </Link>
        <h1 className="text-3xl text-deep-leaf">Checkout</h1>
        <p className="mt-2 text-herb">
          Complete your order for{" "}
          <span className="font-medium text-deep-leaf">{dishName}</span>
          {" "}on{" "}
          <span className="font-medium text-deep-leaf">
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
