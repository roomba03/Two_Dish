"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createMenuItem, type ActionState } from "@/lib/actions/menuActions";

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

export default function AddMenuItemForm() {
  const [state, action, isPending] = useActionState(createMenuItem, initial);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      setFormKey((k) => k + 1);
      setOpen(false);
    }
  }, [state.success]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-neutral-50"
      >
        <span className="font-medium text-neutral-900">+ Add New Dish</span>
        <span className="text-sm text-neutral-400">{open ? "Cancel" : ""}</span>
      </button>

      {open && (
        <form
          key={formKey}
          action={action}
          className="border-t border-neutral-100 px-6 pb-6 pt-5"
        >
          {state.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Dish Name</Label>
              <input
                name="name"
                type="text"
                required
                placeholder="e.g. Chicken Tikka Masala"
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
                placeholder="12.00"
                className={inputClass()}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description</Label>
              <textarea
                name="description"
                required
                rows={2}
                placeholder="A short description customers will see"
                className={`${inputClass()} resize-none`}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Image URL (optional)</Label>
              <input
                name="image_url"
                type="url"
                placeholder="https://..."
                className={inputClass()}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Add Dish"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-400 transition-colors hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
