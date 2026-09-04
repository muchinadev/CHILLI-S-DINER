import { formatKes } from "@/lib/format";
import type { DailyBreakdown } from "@/lib/services/analytics-service";

export function DailyBarChart({ data }: { data: DailyBreakdown[] }) {
  const maxRevenue = Math.max(1, ...data.map((day) => day.revenue));
  const showLabels = data.length <= 7;

  return (
    // items-stretch (not items-end) so each day column actually receives the
    // container's h-32 height — a bar's percentage height can't resolve
    // against a column whose own height is just "however tall its content is".
    <div className="flex h-32 items-stretch gap-1">
      {data.map((day) => {
        const heightPct = Math.round((day.revenue / maxRevenue) * 100);
        const weekday = new Date(day.date + "T00:00:00").toLocaleDateString("en-KE", { weekday: "short" });
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t bg-brand"
              style={{ height: `${Math.max(heightPct, day.revenue > 0 ? 4 : 0)}%` }}
              title={`${day.date}: ${formatKes(day.revenue)}`}
            />
            {showLabels ? <span className="text-[10px] text-stone-400">{weekday[0]}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
