"use client";

import { unscheduleDate } from "@/lib/actions/menuActions";

export default function RemoveScheduleButton({
  scheduleId,
  ordersCount,
}: {
  scheduleId: string;
  ordersCount: number;
}) {
  if (ordersCount > 0) {
    return (
      <span
        className="text-xs font-medium text-warmgray/60"
        title={`Can't remove — ${ordersCount} order${ordersCount === 1 ? "" : "s"} already placed for this day.`}
      >
        Remove
      </span>
    );
  }

  const boundUnschedule = unscheduleDate.bind(null, scheduleId);
  return (
    <form action={boundUnschedule}>
      <button
        type="submit"
        className="text-xs font-medium text-rust transition-opacity hover:opacity-70"
        onClick={(e) => {
          if (!confirm("Remove this date from the schedule?"))
            e.preventDefault();
        }}
      >
        Remove
      </button>
    </form>
  );
}
