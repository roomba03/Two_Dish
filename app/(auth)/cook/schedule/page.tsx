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
        <p className="tfb-eyebrow">Partner dashboard</p>
        <h1 className="mt-1 text-2xl text-deep-leaf">Schedule</h1>
      </div>

      {/* Schedule form */}
      {menuItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-herb py-10 text-center">
          <p className="text-sm text-warmgray">
            Add dishes first before scheduling them.
          </p>
        </div>
      ) : (
        <ScheduleForm menuItems={menuItems} today={today} />
      )}

      {/* 14-day calendar */}
      <div className="tfb-card mt-8 overflow-hidden">
        <div className="border-b border-herb px-6 py-4">
          <h2 className="text-lg text-deep-leaf">Next 14 days</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-herb">
              <th className="tfb-eyebrow px-6 py-3 text-left">Date</th>
              <th className="tfb-eyebrow px-6 py-3 text-left">Dish</th>
              <th className="tfb-eyebrow px-6 py-3 text-right">Capacity</th>
              <th className="tfb-eyebrow px-6 py-3 text-right">Orders</th>
              <th className="tfb-eyebrow px-6 py-3 text-right">&nbsp;</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-herb">
            {days.map((day) => {
              const entry = scheduleByDate[day];
              const isToday = day === today;

              return (
                <tr
                  key={day}
                  className={`transition-colors hover:bg-midsage/20 ${isToday ? "bg-midsage/20" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-deep-leaf">
                        {formatDate(day)}
                      </span>
                      {isToday && (
                        <span className="rounded-md border border-terracotta/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-terracotta">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {entry ? (
                      <span className="text-sm text-deep-leaf">
                        {entry.menu_items.name}
                      </span>
                    ) : (
                      <span className="text-sm text-warmgray">
                        No dish scheduled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-warmgray">
                    {entry ? entry.max_capacity : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-warmgray">
                    {entry ? entry.orders_count : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry && (
                      <RemoveScheduleButton
                        scheduleId={entry.id}
                        ordersCount={entry.orders_count}
                      />
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
