import { getAllMenuItems, getUpcomingSchedule } from "@/lib/data/kitchen";
import ScheduleForm from "./components/ScheduleForm";
import RemoveScheduleButton from "./components/RemoveScheduleButton";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

export default async function SchedulePage() {
  const [menuItems, schedule] = await Promise.all([
    getAllMenuItems(),
    getUpcomingSchedule(),
  ]);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
  }).format(new Date());

  // Build the next 14 days
  const [y, m, d] = today.split("-").map(Number);
  const days: string[] = [];
  for (let i = 0; i < 14; i++) {
    days.push(
      new Intl.DateTimeFormat("en-CA").format(new Date(y, m - 1, d + i))
    );
  }

  const scheduleByDate = Object.fromEntries(
    schedule.map((entry) => [entry.delivery_date, entry])
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Partner Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
          Schedule
        </h1>
      </div>

      {/* Schedule form */}
      {menuItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-10 text-center">
          <p className="text-sm text-neutral-400">
            Add dishes first before scheduling them.
          </p>
        </div>
      ) : (
        <ScheduleForm menuItems={menuItems} today={today} />
      )}

      {/* 14-day calendar */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Next 14 Days
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-6 py-3 text-left font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Date
              </th>
              <th className="px-6 py-3 text-left font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Dish
              </th>
              <th className="px-6 py-3 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Capacity
              </th>
              <th className="px-6 py-3 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Orders
              </th>
              <th className="px-6 py-3 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {days.map((day) => {
              const entry = scheduleByDate[day];
              const isToday = day === today;

              return (
                <tr
                  key={day}
                  className={`transition-colors hover:bg-neutral-50 ${isToday ? "bg-neutral-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900">
                        {formatDate(day)}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {entry ? (
                      <span className="text-sm text-neutral-900">
                        {entry.menu_items.name}
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-400">
                        No dish scheduled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-neutral-500">
                    {entry ? entry.max_capacity : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-neutral-500">
                    {entry ? entry.orders_count : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry && (
                      <RemoveScheduleButton scheduleId={entry.id} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
