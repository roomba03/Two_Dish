import { getCustomerFromCookie } from "@/lib/data/account";
import CartPageClient from "./CartPageClient";

export default async function CartPage() {
  const profile = await getCustomerFromCookie();

  return <CartPageClient profileName={profile?.name ?? null} />;
}
