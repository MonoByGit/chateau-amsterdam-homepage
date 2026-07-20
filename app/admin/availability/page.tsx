// app/admin/availability/page.tsx
import Link from "next/link";
import { listBlocksForMonth, type AvailabilityBlock } from "@/lib/db/availability";

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
  const blocksByDate = new Map<string, AvailabilityBlock[]>();
  for (const block of blocks) {
    const list = blocksByDate.get(block.date) ?? [];
    list.push(block);
    blocksByDate.set(block.date, list);
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
    <div>
      <h1 className="a-h1">Beschikbaarheid</h1>
      <p className="a-subtitle">
        Standaard is elke dag volledig beschikbaar voor reserveringen. Klik op een dag om deze (deels) te
        blokkeren, bijvoorbeeld bij een vakantie, feestdag of besloten evenement.
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "1.5rem 0" }}>
        <h2 className="a-h1" style={{ fontSize: "1.25rem", textTransform: "capitalize" }}>
          {monthLabel}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--a-text-2)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "var(--a-r-sharp)", background: "var(--a-success-soft)", border: "1px solid var(--a-success)", display: "inline-block" }} />
              Beschikbaar
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "var(--a-r-sharp)", background: "var(--a-danger-soft)", border: "1px solid var(--a-danger)", display: "inline-block" }} />
              (Deels) geblokkeerd
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href={`/admin/availability?month=${adjacentMonth(year, month, -1)}`} className="a-btn a-btn--secondary">
              ← Vorige
            </Link>
            <Link href={`/admin/availability?month=${adjacentMonth(year, month, 1)}`} className="a-btn a-btn--secondary">
              Volgende →
            </Link>
          </div>
        </div>
      </div>

      <div className="a-cal-grid">
        {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((label) => (
          <div key={label} className="a-cal-weekday">
            {label}
          </div>
        ))}

        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = `${year}-${pad(month)}-${pad(day)}`;
          const dayBlocks = blocksByDate.get(dateStr) ?? [];
          const isFullDay = dayBlocks.some((b) => b.isFullDay);
          const slotLabels = dayBlocks.filter((b) => !b.isFullDay).map((b) => b.label ?? "");

          return (
            <Link key={dateStr} href={`/admin/availability/${dateStr}`} className="a-cal-day a-cal-day-link">
              <div className="a-cal-day-num">{day}</div>
              {isFullDay ? (
                <span className="a-cal-toggle is-blocked">Hele dag dicht</span>
              ) : slotLabels.length > 0 ? (
                slotLabels.map((label, i) => (
                  <span key={i} className="a-cal-toggle is-blocked" title={label}>
                    {label}
                  </span>
                ))
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
