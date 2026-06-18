"use client";

import { useActionState } from "react";
import { updateMenuItem, type ActionState } from "@/lib/actions/menuActions";
import type { MenuItem } from "@/lib/data/kitchen";

type Props = { item: MenuItem };

const initial: ActionState = {};

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

export default function EditMenuItemForm({ item }: Props) {
  const [state, action, isPending] = useActionState(updateMenuItem, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={item.id} />

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Dish Name</Label>
          <input
            name="name"
            type="text"
            required
            defaultValue={item.name}
            className={inputClass()}
          />
        </div>

        <div>
          <Label>Price</Label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={item.price}
            className={inputClass()}
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Description</Label>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue={item.description}
            className={`${inputClass()} resize-none`}
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Image URL (optional)</Label>
          <input
            name="image_url"
            type="url"
            defaultValue={item.image_url ?? ""}
            placeholder="https://..."
            className={inputClass()}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
