import Link from "next/link";
import { logoutCustomer } from "@/lib/actions/customerAuthActions";

export default function AuthStatusLink({ name }: { name: string }) {
  const firstName = name.split(" ")[0];
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="flex items-center gap-2 rounded-lg border border-herb px-5 py-2 text-sm font-medium text-deep-leaf transition-opacity hover:opacity-70"
      >
        <span className="h-2 w-2 rounded-full bg-herb" aria-hidden />
        Hi, {firstName}
      </Link>
      <form action={logoutCustomer}>
        <button
          type="submit"
          className="text-sm font-medium text-warmgray transition-opacity hover:opacity-70"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
