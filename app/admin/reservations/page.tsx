// app/admin/reservations/page.tsx
import Link from "next/link";
import { listReservations, type ReservationStatus, type ReservationTrack } from "@/lib/db/reservations";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Afgewezen",
};

const STATUS_BADGE_CLASSES: Record<ReservationStatus, string> = {
  nieuw: "bg-blue-100 text-blue-800",
  in_behandeling: "bg-amber-100 text-amber-800",
  bevestigd: "bg-green-100 text-green-800",
  afgewezen: "bg-red-100 text-red-800",
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
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Reserveringen</h1>

      <div className="flex flex-wrap gap-6 mb-6 text-sm">
        <div className="flex gap-2 items-center">
          <span className="text-neutral-500">Status:</span>
          <Link href={filterHref(params, { status: undefined })} className={!status ? "font-semibold underline" : "underline"}>
            Alle
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={filterHref(params, { status: s })}
              className={status === s ? "font-semibold underline" : "underline"}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-neutral-500">Track:</span>
          <Link href={filterHref(params, { track: undefined })} className={!track ? "font-semibold underline" : "underline"}>
            Alle
          </Link>
          {ALL_TRACKS.map((tr) => (
            <Link
              key={tr}
              href={filterHref(params, { track: tr })}
              className={track === tr ? "font-semibold underline" : "underline"}
            >
              {TRACK_LABELS[tr]}
            </Link>
          ))}
        </div>
      </div>

      {reservationList.length === 0 ? (
        <p className="text-neutral-500">Geen reserveringen gevonden.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-neutral-200">
              <th className="py-2 pr-4">Naam</th>
              <th className="py-2 pr-4">Track</th>
              <th className="py-2 pr-4">Gewenste datum</th>
              <th className="py-2 pr-4">Periode</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservationList.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-2 pr-4">
                  <Link href={`/admin/reservations/${r.id}`} className="underline">
                    {r.contactName}
                  </Link>
                </td>
                <td className="py-2 pr-4">{TRACK_LABELS[r.track]}</td>
                <td className="py-2 pr-4">{r.requestedDate}</td>
                <td className="py-2 pr-4">{r.preferredPeriod ?? "-"}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${STATUS_BADGE_CLASSES[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
