// app/admin/availability/page.tsx
import Link from "next/link";
import { listBlocksForMonth, type Daypart } from "@/lib/db/availability";
import { toggleAvailability } from "./actions";

const DAYPARTS: Daypart[] = ["ochtend", "middag", "avond", "hele_dag"];

const DAYPART_LABELS: Record<Daypart, string> = {
  ochtend: "Ochtend",
  middag: "Middag",
  avond: "Avond",
  hele_dag: "Hele dag",
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseMonthParam(month?: string): { year: number; month: number } {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return { year: y, month: m };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Date.getDay() is 0=Sunday..6=Saturday; convert to a Monday-first index
// (0=Monday..6=Sunday) to match the NL week-start convention used below.
function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function adjacentMonth(year: number, month: number, delta: number): string {
  const total = year * 12 + (month - 1) + delta;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${y}-${pad(m)}`;
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month);

  const blocks = await listBlocksForMonth(year, month);
  const blockedByDate = new Map<string, Set<Daypart>>();
  for (const block of blocks) {
    const set = blockedByDate.get(block.date) ?? new Set<Daypart>();
    set.add(block.daypart);
    blockedByDate.set(block.date, set);
  }

  const total = daysInMonth(year, month);
  const firstWeekday = mondayFirstWeekday(new Date(year, month - 1, 1));
  const leadingBlanks = Array.from({ length: firstWeekday });
  const days = Array.from({ length: total }, (_, i) => i + 1);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold capitalize">{monthLabel}</h1>
        <div className="flex gap-4 text-sm">
          <Link href={`/admin/availability?month=${adjacentMonth(year, month, -1)}`}>&larr; Vorige</Link>
          <Link href={`/admin/availability?month=${adjacentMonth(year, month, 1)}`}>Volgende &rarr;</Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((label) => (
          <div key={label} className="text-xs font-semibold text-neutral-500 text-center pb-1">
            {label}
          </div>
        ))}

        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = `${year}-${pad(month)}-${pad(day)}`;
          const blockedSet = blockedByDate.get(dateStr) ?? new Set<Daypart>();

          return (
            <div key={dateStr} className="border border-neutral-200 rounded p-2 min-h-[110px] text-xs">
              <div className="font-semibold mb-1">{day}</div>
              <div className="flex flex-col gap-1">
                {DAYPARTS.map((daypart) => {
                  const blocked = blockedSet.has(daypart);
                  return (
                    <form key={daypart} action={toggleAvailability.bind(null, dateStr, daypart, undefined)}>
                      <button
                        type="submit"
                        className={`w-full text-left px-1.5 py-0.5 rounded ${
                          blocked ? "bg-red-100 text-red-800" : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {DAYPART_LABELS[daypart]}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
