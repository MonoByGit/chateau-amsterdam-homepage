// lib/db/reservations.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";
import {
  createBusinessReservation,
  createTastingReservation,
  getReservation,
  isValidTransition,
  listReservations,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
  type ReservationTrack,
} from "./reservations";

describe("isValidTransition", () => {
  it.each([
    ["nieuw", "in_behandeling", true],
    ["nieuw", "afgewezen", true],
    ["nieuw", "bevestigd", false],
    ["nieuw", "nieuw", false],
    ["in_behandeling", "bevestigd", true],
    ["in_behandeling", "afgewezen", true],
    ["in_behandeling", "nieuw", false],
    ["in_behandeling", "in_behandeling", false],
    ["bevestigd", "nieuw", false],
    ["bevestigd", "in_behandeling", false],
    ["bevestigd", "afgewezen", false],
    ["afgewezen", "nieuw", false],
    ["afgewezen", "in_behandeling", false],
    ["afgewezen", "bevestigd", false],
  ] as [ReservationStatus, ReservationStatus, boolean][])(
    "%s -> %s is %s",
    (from, to, expected) => {
      expect(isValidTransition(from, to)).toBe(expected);
    }
  );
});

describe("reservations repository", () => {
  beforeEach(async () => {
    await db.delete(reservations);
  });

  async function insertReservation(
    overrides: Partial<{
      track: ReservationTrack;
      status: ReservationStatus;
      contactName: string;
      email: string;
      requestedDate: string;
    }> = {}
  ): Promise<Reservation> {
    const [row] = await db
      .insert(reservations)
      .values({
        track: "standaard",
        status: "nieuw",
        contactName: "Test Persoon",
        email: "test@example.com",
        requestedDate: "2026-08-01",
        ...overrides,
      })
      .returning();
    return row;
  }

  describe("listReservations", () => {
    it("returns reservations newest first", async () => {
      const first = await insertReservation({ contactName: "Eerst Ingevoerd" });
      const second = await insertReservation({ contactName: "Daarna Ingevoerd" });

      const result = await listReservations();

      expect(result.map((r) => r.id)).toEqual([second.id, first.id]);
    });

    it("filters by status", async () => {
      const nieuw = await insertReservation({ status: "nieuw" });
      await insertReservation({ status: "bevestigd" });

      const result = await listReservations({ status: "nieuw" });

      expect(result.map((r) => r.id)).toEqual([nieuw.id]);
    });

    it("filters by track", async () => {
      const zakelijk = await insertReservation({ track: "zakelijk" });
      await insertReservation({ track: "standaard" });

      const result = await listReservations({ track: "zakelijk" });

      expect(result.map((r) => r.id)).toEqual([zakelijk.id]);
    });

    it("filters by status and track combined", async () => {
      const match = await insertReservation({ track: "zakelijk", status: "in_behandeling" });
      await insertReservation({ track: "zakelijk", status: "nieuw" });
      await insertReservation({ track: "standaard", status: "in_behandeling" });

      const result = await listReservations({ track: "zakelijk", status: "in_behandeling" });

      expect(result.map((r) => r.id)).toEqual([match.id]);
    });
  });

  describe("getReservation", () => {
    it("returns the matching reservation", async () => {
      const created = await insertReservation({ contactName: "Vindbaar" });

      const result = await getReservation(created.id);

      expect(result?.contactName).toBe("Vindbaar");
    });

    it("returns null when no reservation matches", async () => {
      const result = await getReservation("00000000-0000-0000-0000-000000000000");
      expect(result).toBeNull();
    });
  });

  describe("updateReservationStatus", () => {
    it("applies a valid transition", async () => {
      const created = await insertReservation({ status: "nieuw" });

      await updateReservationStatus(created.id, "in_behandeling");

      const updated = await getReservation(created.id);
      expect(updated?.status).toBe("in_behandeling");
    });

    it("throws on an invalid transition and leaves the status unchanged", async () => {
      const created = await insertReservation({ status: "bevestigd" });

      await expect(updateReservationStatus(created.id, "nieuw")).rejects.toThrow(
        /invalid status transition/i
      );

      const unchanged = await getReservation(created.id);
      expect(unchanged?.status).toBe("bevestigd");
    });

    it("throws when the reservation does not exist", async () => {
      await expect(
        updateReservationStatus("00000000-0000-0000-0000-000000000000", "in_behandeling")
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("createBusinessReservation", () => {
    it("inserts a zakelijk-track reservation with status nieuw", async () => {
      const created = await createBusinessReservation({
        contactName: "Jan Jansen",
        companyName: "Acme B.V.",
        email: "jan@acme.nl",
        phone: "0612345678",
        occasion: "Zakelijke tasting of borrel",
        groupSize: 20,
        notes: "Graag met 20 collega's.",
      });

      expect(created.track).toBe("zakelijk");
      expect(created.status).toBe("nieuw");
      expect(created.contactName).toBe("Jan Jansen");
      expect(created.companyName).toBe("Acme B.V.");
      expect(created.occasion).toBe("Zakelijke tasting of borrel");
      expect(created.groupSize).toBe(20);
      expect(created.notes).toBe("Graag met 20 collega's.");
    });

    it("stores empty optional fields as null", async () => {
      const created = await createBusinessReservation({
        contactName: "Jan Jansen",
        companyName: "",
        email: "jan@acme.nl",
        phone: "",
        occasion: "Iets anders",
        groupSize: null,
        notes: "",
      });

      expect(created.companyName).toBeNull();
      expect(created.phone).toBeNull();
      expect(created.groupSize).toBeNull();
      expect(created.notes).toBeNull();
    });
  });

  describe("createTastingReservation", () => {
    it("inserts a standaard-track reservation with status nieuw", async () => {
      const created = await createTastingReservation({
        contactName: "Sanne de Vries",
        email: "sanne@example.com",
        phone: "0612345678",
        partySize: 4,
        requestedDate: "2026-08-14",
        preferredPeriod: "Zaterdagavond",
        occasion: "30ste verjaardag",
        notes: "Notenallergie in de groep.",
      });

      expect(created.track).toBe("standaard");
      expect(created.status).toBe("nieuw");
      expect(created.contactName).toBe("Sanne de Vries");
      expect(created.partySize).toBe(4);
      expect(created.requestedDate).toBe("2026-08-14");
      expect(created.preferredPeriod).toBe("Zaterdagavond");
      expect(created.occasion).toBe("30ste verjaardag");
      expect(created.notes).toBe("Notenallergie in de groep.");
    });

    it("stores empty optional fields as null", async () => {
      const created = await createTastingReservation({
        contactName: "Sanne de Vries",
        email: "sanne@example.com",
        phone: "",
        partySize: 2,
        requestedDate: "2026-08-14",
        preferredPeriod: "",
        occasion: "",
        notes: "",
      });

      expect(created.phone).toBeNull();
      expect(created.preferredPeriod).toBeNull();
      expect(created.occasion).toBeNull();
      expect(created.notes).toBeNull();
    });
  });
});
