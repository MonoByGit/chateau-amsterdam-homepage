// app/admin/reservations/geschiedenis/page.tsx
import Link from "next/link";
import { listReservations, type ReservationStatus, type ReservationTrack } from "@/lib/db/reservations";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Afgewezen",
};

const ALL_STATUSES: ReservationStatus[] = ["nieuw", "in_behandeling", "bevestigd", "afgewezen"];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
}

export default async function ReservationsHistoryPage() {
  const all = await listReservations();

  const byMonth = new Map<
    string,
    { total: number; track: Record<ReservationTrack, number>; status: Record<ReservationStatus, number> }
  >();

  for (const r of all) {
    const key = monthKey(new Date(r.createdAt));
    const entry = byMonth.get(key) ?? {
      total: 0,
      track: { standaard: 0, zakelijk: 0 },
      status: { nieuw: 0, in_behandeling: 0, bevestigd: 0, afgewezen: 0 },
    };
    entry.total += 1;
    entry.track[r.track] += 1;
    entry.status[r.status] += 1;
    byMonth.set(key, entry);
  }

  const months = Array.from(byMonth.keys()).sort().reverse();

  return (
    <div>
      <Link href="/admin/reservations" className="a-link" style={{ fontSize: "0.8125rem" }}>
        ← Reserveringen
      </Link>
      <h1 className="a-h1" style={{ marginTop: "0.5rem" }}>
        Geschiedenis
      </h1>
      <p className="a-subtitle" style={{ marginBottom: "1.5rem" }}>
        Aantal reserveringen per maand, ingedeeld naar track en status, op basis van het moment van aanvraag.
      </p>

      {months.length === 0 ? (
        <div className="a-card">
          <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
            Nog geen reserveringen ontvangen.
          </p>
        </div>
      ) : (
        <div className="a-card">
          {months.map((key) => {
            const entry = byMonth.get(key)!;
            return (
              <div key={key} className="a-card-row">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                  <span className="a-label" style={{ textTransform: "capitalize" }}>
                    {monthLabel(key)}
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "var(--a-text-2)" }}>{entry.total} reserveringen</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <span className="a-badge a-badge--neutral">Standaard: {entry.track.standaard}</span>
                  <span className="a-badge a-badge--neutral">Zakelijk: {entry.track.zakelijk}</span>
                  {ALL_STATUSES.map((s) =>
                    entry.status[s] > 0 ? (
                      <span key={s} className="a-badge a-badge--neutral">
                        {STATUS_LABELS[s]}: {entry.status[s]}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
