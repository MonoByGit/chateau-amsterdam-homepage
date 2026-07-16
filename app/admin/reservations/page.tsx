// app/admin/reservations/page.tsx
import Link from "next/link";
import { listReservations, type ReservationStatus, type ReservationTrack } from "@/lib/db/reservations";

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
  searchParams: Promise<{ status?: string; track?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as ReservationStatus | undefined;
  const track = params.track as ReservationTrack | undefined;

  const reservationList = await listReservations({ status, track });

  return (
    <div>
      <h1 className="a-h1">Reserveringen</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.25rem", marginBottom: "1.5rem" }}>
        <div className="a-chip-group">
          <span className="a-eyebrow" style={{ marginRight: "0.25rem" }}>
            Status
          </span>
          <Link href={filterHref(params, { status: undefined })} className={`a-chip${!status ? " is-active" : ""}`}>
            Alle
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link key={s} href={filterHref(params, { status: s })} className={`a-chip${status === s ? " is-active" : ""}`}>
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
        <div className="a-chip-group">
          <span className="a-eyebrow" style={{ marginRight: "0.25rem" }}>
            Track
          </span>
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

      <div className="a-card">
        {reservationList.length === 0 ? (
          <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
            Geen reserveringen gevonden.
          </p>
        ) : (
          reservationList.map((r) => (
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
                  {TRACK_LABELS[r.track]} · {r.requestedDate}
                  {r.preferredPeriod ? ` · ${r.preferredPeriod}` : ""}
                </div>
              </div>
              <span className={`a-badge ${STATUS_BADGE_VARIANT[r.status]}`}>{STATUS_LABELS[r.status]}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
