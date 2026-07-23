// app/admin/availability/[date]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDayBlocks, MAX_SLOTS_PER_DAY } from "@/lib/db/availability";
import { formatAdminDate } from "@/lib/format-date";
import { DayForm } from "../day-form";

export default async function AvailabilityDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const blocks = await getDayBlocks(date);
  const isFullDay = blocks.some((b) => b.isFullDay);
  const slots = blocks.filter((b) => !b.isFullDay).map((b) => b.label ?? "");
  const initialSlots = Array.from({ length: MAX_SLOTS_PER_DAY }, (_, i) => slots[i] ?? "");

  const [year, month] = date.split("-");

  return (
    <div>
      <Link href={`/admin/availability?month=${year}-${month}`} className="a-link" style={{ fontSize: "0.8125rem" }}>
        ← Terug naar kalender
      </Link>
      <h1 className="a-h1" style={{ marginTop: "0.75rem", textTransform: "capitalize" }}>
        {formatAdminDate(date)}
      </h1>
      <p className="a-subtitle">
        Standaard zijn de tours en tastings geopend op donderdag, vrijdag en zaterdag met vaste tijdslots (15:00, 17:00 en 19:00 uur).
        Vink hieronder aan als de hele dag dicht is, of blokkeer specifieke tijdslots.
      </p>

      <div style={{ marginTop: "1.5rem", maxWidth: "32rem" }}>
        <DayForm date={date} initialIsFullDay={isFullDay} initialSlots={initialSlots} />
      </div>
    </div>
  );
}
