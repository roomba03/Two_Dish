"use client";

import { unscheduleDate } from "@/lib/actions/menuActions";

export default function RemoveScheduleButton({
  scheduleId,
}: {
  scheduleId: string;
}) {
  const boundUnschedule = unscheduleDate.bind(null, scheduleId);
  return (
    <form action={boundUnschedule}>
      <button
        type="submit"
        className="text-xs font-medium text-red-400 transition-opacity hover:opacity-70"
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
