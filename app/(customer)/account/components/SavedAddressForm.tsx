"use client";

import { useActionState } from "react";
import { updateSavedAddress, type AddressState } from "@/lib/actions/customerAuthActions";
import type { CustomerProfile } from "@/lib/data/account";

const initial: AddressState = {};

function inputClass() {
  return "w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
      {children}
    </label>
  );
}

export default function SavedAddressForm({
  profile,
}: {
  profile: CustomerProfile;
}) {
  const [state, action, isPending] = useActionState(updateSavedAddress, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Address saved.
        </div>
      )}

      <div>
        <Label>Street Address</Label>
        <input
          name="delivery_street"
          type="text"
          defaultValue={profile.delivery_street ?? ""}
          placeholder="123 Main St"
          autoComplete="street-address"
          className={inputClass()}
        />
      </div>

      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <div>
          <Label>City</Label>
          <input
            name="delivery_city"
            type="text"
            defaultValue={profile.delivery_city ?? ""}
            placeholder="Overland Park"
            autoComplete="address-level2"
            className={inputClass()}
          />
        </div>
        <div>
          <Label>ZIP</Label>
          <input
            name="delivery_zip"
            type="text"
            defaultValue={profile.delivery_zip ?? ""}
            placeholder="66221"
            maxLength={5}
            inputMode="numeric"
            autoComplete="postal-code"
            className={inputClass()}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
