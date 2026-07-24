// app/admin/reservations/page.tsx
import Link from "next/link";
import {
  isValidTransition,
  listReservations,
  type ReservationStatus,
  type ReservationTrack,
} from "@/lib/db/reservations";
import { updateStatus } from "./actions";
import { formatAdminDate } from "@/lib/format-date";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Afgewezen",
};

const STATUS_BADGE_VARIANT: Record<ReservationStatus, string> = {
  nieuw: "a-badge--info",
  in_behandeling: "a-badge--warning",
  bevestigd: "a-badge--success",
  afgewezen: "a-badge--danger",
};

const TRACK_LABELS: Record<ReservationTrack, string> = {
  standaard: "Standaard",
  zakelijk: "Zakelijk",
};

const ALL_STATUSES: ReservationStatus[] = ["nieuw", "in_behandeling", "bevestigd", "afgewezen"];
const ALL_TRACKS: ReservationTrack[] = ["standaard", "zakelijk"];

function filterHref(
  current: { status?: string; track?: string },
  next: { status?: string; track?: string }
): string {
  const params = new URLSearchParams();
  const status = "status" in next ? next.status : current.status;
  const track = "track" in next ? next.track : current.track;
  if (status) params.set("status", status);
  if (track) params.set("track", track);
  const qs = params.toString();
  return qs ? `/admin/reservations?${qs}` : "/admin/reservations";
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; track?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as ReservationStatus | undefined;
  const track = params.track as ReservationTrack | undefined;
  const query = (params.q || "").toLowerCase().trim();

  let reservationList = await listReservations({ status, track });

  if (query) {
    reservationList = reservationList.filter((r) =>
      r.contactName.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      (r.companyName && r.companyName.toLowerCase().includes(query)) ||
      (r.phone && r.phone.includes(query))
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="a-h1">Reserveringen</h1>
          <p className="a-subtitle" style={{ margin: 0 }}>Beheer alle proeverijen en zakelijke aanvragen.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <a
            href="/admin/reservations/export"
            className="a-btn a-btn--secondary"
            style={{ fontSize: "0.8125rem" }}
            download
          >
            📥 Exporteer naar CSV
          </a>
          <Link href="/admin/reservations/geschiedenis" className="a-link" style={{ fontSize: "0.8125rem" }}>
            Geschiedenis →
          </Link>
        </div>
      </div>

      <div className="a-filter-bar" style={{ marginTop: "1.25rem", marginBottom: "1.5rem" }}>
        <div className="a-filter-row">
          <span className="a-eyebrow" style={{ marginRight: "0.25rem" }}>
            Status
          </span>
          <div className="a-chip-group">
            <Link href={filterHref(params, { status: undefined })} className={`a-chip${!status ? " is-active" : ""}`}>
              Alle
            </Link>
            {ALL_STATUSES.map((s) => (
              <Link key={s} href={filterHref(params, { status: s })} className={`a-chip${status === s ? " is-active" : ""}`}>
                {STATUS_LABELS[s]}
              </Link>
            ))}
          </div>
        </div>
        <div className="a-filter-row">
          <span className="a-eyebrow" style={{ marginRight: "0.25rem" }}>
            Track
          </span>
          <div className="a-chip-group">
            <Link href={filterHref(params, { track: undefined })} className={`a-chip${!track ? " is-active" : ""}`}>
              Alle
            </Link>
            {ALL_TRACKS.map((tr) => (
              <Link key={tr} href={filterHref(params, { track: tr })} className={`a-chip${track === tr ? " is-active" : ""}`}>
                {TRACK_LABELS[tr]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="a-card">
        {reservationList.length === 0 ? (
          <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
            Geen reserveringen gevonden.
          </p>
        ) : (
          reservationList.map((r) => {
            const nextStatuses = ALL_STATUSES.filter((s) => isValidTransition(r.status, s));
            return (
              <div key={r.id} className="a-card-row" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href={`/admin/reservations/${r.id}`} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                  <div className="a-label" style={{ color: "var(--a-text)" }}>
                    {r.contactName}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "0.125rem" }}>
                    {TRACK_LABELS[r.track]} · {r.requestedDate ? formatAdminDate(r.requestedDate) : "-"}
                    {r.preferredPeriod ? ` · ${r.preferredPeriod}` : ""}
                  </div>
                </Link>
                <span className={`a-badge ${STATUS_BADGE_VARIANT[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                {nextStatuses.length > 0 ? (
                  <div className="a-inline-actions">
                    {nextStatuses.map((s) => (
                      <form key={s} action={updateStatus.bind(null, r.id, s)}>
                        <button type="submit" className="a-btn a-btn--secondary a-btn--sm">
                          {STATUS_LABELS[s]}
                        </button>
                      </form>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
