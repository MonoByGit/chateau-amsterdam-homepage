// app/admin/reservations/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReservation, isValidTransition, type ReservationStatus } from "@/lib/db/reservations";
import { updateStatus } from "../actions";
import { formatAdminDate } from "@/lib/format-date";
import { RescheduleForm } from "./reschedule-form";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In overleg / Behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Geannuleerd",
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
    <div className="a-card-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", padding: "0.5rem 0", borderBottom: "1px solid var(--a-border)" }}>
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
  const mailtoSubject = encodeURIComponent(`Chateau Amsterdam · Je tasting aanvraag (${reservation.requestedDate || ""})`);
  const mailtoHref = `mailto:${reservation.email}?subject=${mailtoSubject}`;
  const telHref = reservation.phone ? `tel:${reservation.phone.replace(/[^0-9+]/g, "")}` : null;

  return (
    <div style={{ maxWidth: "52rem" }}>
      <Link href="/admin/reservations" className="a-link" style={{ fontSize: "0.8125rem" }}>
        ← Terug naar reserveringen
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
        <h1 className="a-h1" style={{ fontSize: "1.5rem", margin: 0 }}>
          {reservation.contactName}
        </h1>
        <span className={`a-badge ${STATUS_BADGE_VARIANT[reservation.status]}`}>{STATUS_LABELS[reservation.status]}</span>
      </div>
      
      {/* Contact Quick Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
        {telHref ? (
          <a
            href={telHref}
            className="a-btn a-btn--primary"
            style={{ fontSize: "0.875rem", padding: "0.45rem 0.9rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            📞 Bel klant: {reservation.phone}
          </a>
        ) : null}

        <a
          href={mailtoHref}
          className="a-btn a-btn--secondary"
          style={{ fontSize: "0.875rem", padding: "0.45rem 0.9rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          ✉️ E-mail: {reservation.email}
        </a>
      </div>

      {/* Reservation Overview Card */}
      <div className="a-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <h2 className="a-h2" style={{ fontSize: "1rem", margin: "0 0 0.75rem 0", color: "var(--a-text)" }}>
          📋 Oorspronkelijke Aanvraaggegevens
        </h2>
        <Row label="Type aanvraag" value={reservation.track === "standaard" ? "Particulier (Tour & Tasting)" : "Zakelijk"} />
        <Row label="Telefoonnummer" value={reservation.phone ?? "Niet opgegeven"} />
        <Row label="Gezelschapsgrootte" value={`${reservation.partySize || reservation.groupSize || 2} personen`} />
        {reservation.companyName ? <Row label="Bedrijf" value={reservation.companyName} /> : null}
        {reservation.occasion ? <Row label="Gelegenheid" value={reservation.occasion} /> : null}
        <Row label="Aangevraagde datum" value={reservation.requestedDate ? formatAdminDate(reservation.requestedDate) : "In overleg"} />
        <Row
          label="Aangevraagd tijdslot / Voorkeur"
          value={reservation.preferredPeriod ? `${reservation.preferredPeriod}` : "Niet gespecificeerd"}
        />
        <Row label="Notities & Dieetwensen" value={reservation.notes ?? "Geen opmerkingen"} />
      </div>

      {/* Rescheduling & Management Form */}
      <RescheduleForm
        reservationId={reservation.id}
        initialDate={reservation.requestedDate}
        initialPeriod={reservation.preferredPeriod}
        initialPartySize={reservation.partySize ?? reservation.groupSize ?? 2}
        initialNotes={reservation.notes}
        track={reservation.track}
      />

      {/* Manual Status Overrides */}
      <div style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid var(--a-border)" }}>
        <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginBottom: "0.5rem" }}>
          Handmatige statuswijziging:
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {nextStatuses.map((s) => (
            <form key={s} action={updateStatus.bind(null, reservation.id, s)}>
              <button type="submit" className="a-btn a-btn--secondary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>
                Zet status op: {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
