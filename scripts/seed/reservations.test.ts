// scripts/seed/reservations.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";
import { listReservations } from "@/lib/db/reservations";
import { seedReservations } from "./reservations";

describe("seedReservations", () => {
  beforeEach(async () => {
    await db.delete(reservations);
  });

  it("seeds at least two standaard-track reservations, including one nieuw and one bevestigd", async () => {
    await seedReservations();

    const standaard = await listReservations({ track: "standaard" });

    expect(standaard.length).toBeGreaterThanOrEqual(2);
    expect(standaard.some((r) => r.status === "nieuw")).toBe(true);
    expect(standaard.some((r) => r.status === "bevestigd")).toBe(true);
  });

  it("seeds at least two zakelijk-track reservations, including one nieuw and one in_behandeling", async () => {
    await seedReservations();

    const zakelijk = await listReservations({ track: "zakelijk" });

    expect(zakelijk.length).toBeGreaterThanOrEqual(2);
    expect(zakelijk.some((r) => r.status === "nieuw")).toBe(true);
    expect(zakelijk.some((r) => r.status === "in_behandeling")).toBe(true);
  });
});
