"use client";

import { useActionState } from "react";
import { updateSavedAddress, type AddressState } from "@/lib/actions/customerAuthActions";
import type { CustomerProfile } from "@/lib/data/account";

const initial: AddressState = {};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="tfb-label">{children}</label>;
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
        <div className="rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-herb bg-midsage/30 px-4 py-3 text-sm text-warmgray">
          Address saved.
        </div>
      )}

      <div>
        <Label>Street address</Label>
        <input
          name="delivery_street"
          type="text"
          defaultValue={profile.delivery_street ?? ""}
          placeholder="123 Main St"
          autoComplete="street-address"
          className="tfb-input w-full"
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
            className="tfb-input w-full"
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
            className="tfb-input w-full"
          />
        </div>
      </div>

      <button type="submit" disabled={isPending} className="tfb-btn-primary w-full">
        {isPending ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
