// app/admin/page.tsx
import Link from "next/link";
import { listReservations } from "@/lib/db/reservations";
import { formatAdminDate } from "@/lib/format-date";

export const dynamic = "force-dynamic";

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

export default async function DashboardPage() {
  const [nieuw, inBehandeling] = await Promise.all([
    listReservations({ status: "nieuw" }),
    listReservations({ status: "in_behandeling" }),
  ]);

  const openReservations = [...nieuw, ...inBehandeling]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="a-h1">Overzicht</h1>
      <p className="a-subtitle">Wat er nu speelt bij Chateau Amsterdam.</p>

      <div className="a-stat-grid" style={{ marginTop: "1.5rem" }}>
        <div className="a-stat-card">
          <div className="a-stat-value">{nieuw.length + inBehandeling.length}</div>
          <div className="a-stat-label">Openstaande reserveringen</div>
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
                className="a-card-row a-reservation-main"
                style={{ textDecoration: "none", width: "100%", boxSizing: "border-box" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="a-label" style={{ color: "var(--a-text)" }}>
                    {r.contactName}
                  </div>
                  <div className="a-reservation-meta">
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
        <h2>Bezoekersstatistieken</h2>
        <div className="a-placeholder-card">
          Umami is gekoppeld voor bezoekersstatistieken; dit dashboard-blok toont die cijfers nog niet — gepland
          voor een latere fase.
        </div>
      </div>
    </div>
  );
}
