// scripts/seed/reservations.ts
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";

const SAMPLE_RESERVATIONS = [
  {
    track: "standaard",
    status: "nieuw",
    contactName: "Sanne de Vries",
    email: "sanne.devries@gmail.com",
    phone: "+31 6 12345678",
    partySize: 4,
    occasion: "30ste verjaardag",
    preferredPeriod: "Avond",
    requestedDate: "2026-08-14",
    notes: "Viert haar verjaardag met een groepje vriendinnen, graag een rustig hoekje.",
  },
  {
    track: "standaard",
    status: "bevestigd",
    contactName: "Mark Jansen",
    email: "mark.jansen@outlook.com",
    phone: "+31 6 23456789",
    partySize: 2,
    occasion: "5-jarig huwelijksjubileum",
    preferredPeriod: "Middag",
    requestedDate: "2026-07-25",
    notes: "Tafel bij het raam graag, als dat kan.",
  },
  {
    track: "zakelijk",
    status: "nieuw",
    contactName: "Willem Bakker",
    email: "willem.bakker@bakkerpartners.nl",
    phone: "+31 20 6543210",
    companyName: "Bakker & Partners Advocaten",
    groupSize: 12,
    occasion: "Kantooruitje",
    preferredPeriod: "Ochtend",
    requestedDate: "2026-09-02",
    notes: "Zoekt een proeverij gecombineerd met een korte rondleiding.",
  },
  {
    track: "zakelijk",
    status: "in_behandeling",
    contactName: "Fatima El Amrani",
    email: "fatima.elamrani@vandermeerconsultancy.nl",
    phone: "+31 6 34567890",
    companyName: "Van der Meer Consultancy",
    groupSize: 25,
    occasion: "Kwartaalborrel",
    preferredPeriod: "Avond",
    requestedDate: "2026-08-20",
    notes: "Wil een proeverij combineren met een borrel voor het hele team.",
  },
] as const;

// Sample rows are inserted only if a reservation with that email doesn't
// already exist, so re-running the combined seed script doesn't duplicate
// demo data (there's no unique constraint on email to upsert against, since
// a real customer can legitimately submit more than one request).
export async function seedReservations(): Promise<void> {
  for (const sample of SAMPLE_RESERVATIONS) {
    const [existing] = await db
      .select({ id: reservations.id })
      .from(reservations)
      .where(eq(reservations.email, sample.email))
      .limit(1);

    if (existing) continue;

    await db.insert(reservations).values(sample);
  }
}
