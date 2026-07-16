// app/admin/reservations/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReservation, isValidTransition, type ReservationStatus } from "@/lib/db/reservations";
import { updateStatus } from "../actions";

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

const ALL_STATUSES: ReservationStatus[] = ["nieuw", "in_behandeling", "bevestigd", "afgewezen"];

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="a-card-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem" }}>
      <span style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>{label}</span>
      <span style={{ color: "var(--a-text)", fontSize: "0.875rem", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

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
    <div style={{ maxWidth: "40rem", margin: "0 auto" }}>
      <Link href="/admin/reservations" className="a-link" style={{ fontSize: "0.8125rem" }}>
        ← Reserveringen
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
        <h1 className="a-h1" style={{ fontSize: "1.5rem" }}>
          {reservation.contactName}
        </h1>
        <span className={`a-badge ${STATUS_BADGE_VARIANT[reservation.status]}`}>{STATUS_LABELS[reservation.status]}</span>
      </div>
      <p className="a-subtitle" style={{ marginBottom: "1.5rem" }}>{reservation.email}</p>

      <div className="a-card">
        <Row label="Track" value={reservation.track === "standaard" ? "Standaard" : "Zakelijk"} />
        <Row label="Telefoon" value={reservation.phone ?? "-"} />
        <Row label="Gezelschapsgrootte" value={reservation.partySize ?? "-"} />
        <Row label="Groepsgrootte" value={reservation.groupSize ?? "-"} />
        <Row label="Bedrijf" value={reservation.companyName ?? "-"} />
        <Row label="Gelegenheid" value={reservation.occasion ?? "-"} />
        <Row label="Gewenste datum" value={reservation.requestedDate ?? "-"} />
        <Row label="Gewenste periode" value={reservation.preferredPeriod ?? "-"} />
        <Row label="Notities" value={reservation.notes ?? "-"} />
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {nextStatuses.length > 0 ? (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {nextStatuses.map((s) => (
              <form key={s} action={updateStatus.bind(null, reservation.id, s)}>
                <button type="submit" className="a-btn a-btn--secondary">
                  {STATUS_LABELS[s]}
                </button>
              </form>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "0.875rem", color: "var(--a-text-2)" }}>
            Deze reservering is afgehandeld — er zijn geen vervolgstappen.
          </p>
        )}
      </div>
    </div>
  );
}
