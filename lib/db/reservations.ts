// lib/db/reservations.ts
import { and, desc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";

export type Reservation = InferSelectModel<typeof reservations>;
export type ReservationStatus = Reservation["status"];
export type ReservationTrack = Reservation["track"];

export const ALL_RESERVATION_STATUSES: ReservationStatus[] = [
  "nieuw",
  "in_behandeling",
  "bevestigd",
  "afgewezen",
];

// Forward transitions only. `bevestigd` and `afgewezen` are terminal — a
// request can be declined directly from `nieuw` (no need to pass through
// `in_behandeling` first), but nothing moves out of a confirmed or
// rejected reservation.
const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  nieuw: ["in_behandeling", "bevestigd", "afgewezen"],
  in_behandeling: ["bevestigd", "afgewezen"],
  bevestigd: [],
  afgewezen: [],
};

export function isValidTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export async function listReservations(
  filters: { status?: ReservationStatus; track?: ReservationTrack } = {}
): Promise<Reservation[]> {
  const conditions = [];
  if (filters.status) conditions.push(eq(reservations.status, filters.status));
  if (filters.track) conditions.push(eq(reservations.track, filters.track));

  return db
    .select()
    .from(reservations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reservations.createdAt));
}

export type BusinessReservationInput = {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  occasion: string;
  groupSize: number | null;
  notes: string;
};

export async function createBusinessReservation(input: BusinessReservationInput): Promise<Reservation> {
  const [row] = await db
    .insert(reservations)
    .values({
      track: "zakelijk",
      contactName: input.contactName,
      companyName: input.companyName || null,
      email: input.email,
      phone: input.phone || null,
      occasion: input.occasion,
      groupSize: input.groupSize,
      notes: input.notes || null,
    })
    .returning();
  return row;
}

export type TastingReservationInput = {
  contactName: string;
  email: string;
  phone: string;
  partySize: number;
  requestedDate: string;
  preferredPeriod: string;
  occasion: string;
  notes: string;
};

export async function createTastingReservation(input: TastingReservationInput): Promise<Reservation> {
  const [row] = await db
    .insert(reservations)
    .values({
      track: "standaard",
      contactName: input.contactName,
      email: input.email,
      phone: input.phone || null,
      partySize: input.partySize,
      requestedDate: input.requestedDate,
      preferredPeriod: input.preferredPeriod || null,
      occasion: input.occasion || null,
      notes: input.notes || null,
    })
    .returning();
  return row;
}

export async function getReservation(id: string): Promise<Reservation | null> {
  const [row] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return row ?? null;
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  const existing = await getReservation(id);
  if (!existing) {
    throw new Error(`Reservation not found: ${id}`);
  }
  if (!isValidTransition(existing.status, status)) {
    throw new Error(
      `Invalid status transition: cannot move reservation ${id} from "${existing.status}" to "${status}"`
    );
  }
  await db
    .update(reservations)
    .set({ status, updatedAt: new Date() })
    .where(eq(reservations.id, id));
}
