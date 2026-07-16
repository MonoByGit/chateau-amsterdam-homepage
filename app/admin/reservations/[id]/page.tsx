// app/admin/reservations/[id]/page.tsx
import { notFound } from "next/navigation";
import { getReservation, isValidTransition, type ReservationStatus } from "@/lib/db/reservations";
import { updateStatus } from "../actions";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Afgewezen",
};

const ALL_STATUSES: ReservationStatus[] = ["nieuw", "in_behandeling", "bevestigd", "afgewezen"];

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await getReservation(id);
  if (!reservation) notFound();

  const nextStatuses = ALL_STATUSES.filter((s) => isValidTransition(reservation.status, s));

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-1">{reservation.contactName}</h1>
      <p className="text-neutral-500 mb-6">{reservation.email}</p>

      <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm mb-8">
        <dt className="text-neutral-500">Track</dt>
        <dd>{reservation.track === "standaard" ? "Standaard" : "Zakelijk"}</dd>

        <dt className="text-neutral-500">Status</dt>
        <dd>{STATUS_LABELS[reservation.status]}</dd>

        <dt className="text-neutral-500">Telefoon</dt>
        <dd>{reservation.phone ?? "-"}</dd>

        <dt className="text-neutral-500">Gezelschapsgrootte</dt>
        <dd>{reservation.partySize ?? "-"}</dd>

        <dt className="text-neutral-500">Groepsgrootte</dt>
        <dd>{reservation.groupSize ?? "-"}</dd>

        <dt className="text-neutral-500">Bedrijf</dt>
        <dd>{reservation.companyName ?? "-"}</dd>

        <dt className="text-neutral-500">Gelegenheid</dt>
        <dd>{reservation.occasion ?? "-"}</dd>

        <dt className="text-neutral-500">Gewenste datum</dt>
        <dd>{reservation.requestedDate}</dd>

        <dt className="text-neutral-500">Gewenste periode</dt>
        <dd>{reservation.preferredPeriod ?? "-"}</dd>

        <dt className="text-neutral-500">Notities</dt>
        <dd>{reservation.notes ?? "-"}</dd>
      </dl>

      {nextStatuses.length > 0 ? (
        <div className="flex gap-3">
          {nextStatuses.map((s) => (
            <form key={s} action={updateStatus.bind(null, reservation.id, s)}>
              <button
                type="submit"
                className="border border-neutral-900 rounded-full px-4 py-2 text-sm hover:bg-neutral-900 hover:text-white"
              >
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Deze reservering is afgehandeld — er zijn geen vervolgstappen.</p>
      )}
    </div>
  );
}
