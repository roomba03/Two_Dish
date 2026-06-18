"use client";

import { useActionState, useEffect, useState } from "react";
import { scheduleMenuItem, type ActionState } from "@/lib/actions/menuActions";
import type { MenuItem } from "@/lib/data/kitchen";

type Props = { menuItems: MenuItem[]; today: string };

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

export default function ScheduleForm({ menuItems, today }: Props) {
  const [state, action, isPending] = useActionState(scheduleMenuItem, initial);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) setFormKey((k) => k + 1);
  }, [state.success]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-6">
      <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Schedule a Dish
      </p>

      <form key={formKey} action={action}>
        {state.error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Schedule updated.
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <Label>Delivery Date</Label>
            <input
              name="delivery_date"
              type="date"
              required
              min={today}
              className={inputClass()}
            />
          </div>

          <div>
            <Label>Dish</Label>
            <select name="menu_item_id" required className={inputClass()}>
              <option value="">Select a dish…</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Max Capacity</Label>
            <input
              name="max_capacity"
              type="number"
              min="1"
              defaultValue="50"
              required
              className={inputClass()}
            />
          </div>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}
