// app/admin/page.tsx
import Link from "next/link";
import { listReservations } from "@/lib/db/reservations";
import { listBlocksForMonth } from "@/lib/db/availability";
import { listWines } from "@/lib/db/wines";
import { formatAdminDate } from "@/lib/format-date";

const STATUS_LABELS: Record<string, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Afgewezen",
};

const STATUS_BADGE_VARIANT: Record<string, string> = {
  nieuw: "a-badge--info",
  in_behandeling: "a-badge--warning",
  bevestigd: "a-badge--success",
  afgewezen: "a-badge--danger",
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export default async function DashboardPage() {
  const [nieuw, inBehandeling, allWines] = await Promise.all([
    listReservations({ status: "nieuw" }),
    listReservations({ status: "in_behandeling" }),
    listWines({}),
  ]);

  const openReservations = [...nieuw, ...inBehandeling]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [thisMonthBlocks, nextMonthBlocks] = await Promise.all([
    listBlocksForMonth(now.getFullYear(), now.getMonth() + 1),
    listBlocksForMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1),
  ]);

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const upcomingByDate = new Map<string, { isFullDay: boolean; labels: string[] }>();
  for (const b of [...thisMonthBlocks, ...nextMonthBlocks]) {
    if (b.date < todayStr) continue;
    const entry = upcomingByDate.get(b.date) ?? { isFullDay: false, labels: [] };
    if (b.isFullDay) entry.isFullDay = true;
    else if (b.label) entry.labels.push(b.label);
    upcomingByDate.set(b.date, entry);
  }
  const upcomingBlocks = [...upcomingByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 5);

  const activeWines = allWines.filter((w) => w.isActive).length;

  return (
    <div>
      <h1 className="a-h1">Overzicht</h1>
      <p className="a-subtitle">Wat er nu speelt bij Chateau Amsterdam.</p>

      <div className="a-stat-grid" style={{ marginTop: "1.5rem" }}>
        <div className="a-stat-card">
          <div className="a-stat-value">{nieuw.length + inBehandeling.length}</div>
          <div className="a-stat-label">Openstaande reserveringen</div>
        </div>
        <div className="a-stat-card">
          <div className="a-stat-value">{activeWines}</div>
          <div className="a-stat-label">Actieve wijnen ({allWines.length} totaal)</div>
        </div>
        <div className="a-stat-card">
          <div className="a-stat-value">{upcomingBlocks.length}</div>
          <div className="a-stat-label">Geblokkeerde dagen (komende periode)</div>
        </div>
      </div>

      <div className="a-dashboard-section">
        <h2>Openstaande reserveringen</h2>
        {openReservations.length === 0 ? (
          <div className="a-card">
            <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
              Geen openstaande reserveringen, helemaal bij.
            </p>
          </div>
        ) : (
          <div className="a-card">
            {openReservations.map((r) => (
              <Link
                key={r.id}
                href={`/admin/reservations/${r.id}`}
                className="a-card-row"
                style={{ display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="a-label" style={{ color: "var(--a-text)" }}>
                    {r.contactName}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "0.125rem" }}>
                    {r.track === "standaard" ? "Standaard" : "Zakelijk"} ·{" "}
                    {r.requestedDate ? formatAdminDate(r.requestedDate) : "-"}
                  </div>
                </div>
                <span className={`a-badge ${STATUS_BADGE_VARIANT[r.status]}`}>{STATUS_LABELS[r.status]}</span>
              </Link>
            ))}
          </div>
        )}
        <div style={{ marginTop: "0.75rem" }}>
          <Link href="/admin/reservations" className="a-link" style={{ fontSize: "0.8125rem" }}>
            Alle reserveringen bekijken →
          </Link>
        </div>
      </div>

      <div className="a-dashboard-section">
        <h2>Binnenkort geblokkeerd</h2>
        <p className="a-subtitle" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          Alleen blokkades vanaf vandaag, oudere blokkades staan hier niet.
        </p>
        {upcomingBlocks.length === 0 ? (
          <div className="a-card">
            <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
              Niets geblokkeerd in de komende periode.
            </p>
          </div>
        ) : (
          <div className="a-card">
            {upcomingBlocks.map(([date, entry]) => (
              <Link
                key={date}
                href={`/admin/availability/${date}`}
                className="a-card-row"
                style={{ display: "flex", justifyContent: "space-between", textDecoration: "none" }}
              >
                <span className="a-label" style={{ color: "var(--a-text)" }}>
                  {formatAdminDate(date)}
                </span>
                <span style={{ fontSize: "0.8125rem", color: "var(--a-text-2)" }}>
                  {entry.isFullDay ? "Hele dag dicht" : entry.labels.join(", ")}
                </span>
              </Link>
            ))}
          </div>
        )}
        <div style={{ marginTop: "0.75rem" }}>
          <Link href="/admin/availability" className="a-link" style={{ fontSize: "0.8125rem" }}>
            Beschikbaarheidskalender openen →
          </Link>
        </div>
      </div>

      <div className="a-dashboard-section">
        <h2>Bezoekersstatistieken</h2>
        <div className="a-placeholder-card">
          Umami is gekoppeld voor bezoekersstatistieken; dit dashboard-blok toont die cijfers nog niet — gepland
          voor een latere fase.
        </div>
      </div>
    </div>
  );
}
