// app/admin/reservations/export/route.ts
import { NextResponse } from "next/server";
import { listReservations } from "@/lib/db/reservations";

export const dynamic = "force-dynamic";

export async function GET() {
  const reservations = await listReservations();

  const headers = [
    "ID",
    "Datum",
    "Tijdslot",
    "Track",
    "Status",
    "Naam",
    "Email",
    "Telefoon",
    "Aantal Gasten",
    "Bedrijfsnaam",
    "Opmerkingen",
  ];

  const rows = reservations.map((r) => [
    r.id,
    r.requestedDate || "",
    r.preferredPeriod || "",
    r.track,
    r.status,
    `"${(r.contactName || "").replace(/"/g, '""')}"`,
    `"${(r.email || "").replace(/"/g, '""')}"`,
    `"${(r.phone || "").replace(/"/g, '""')}"`,
    r.partySize || r.groupSize || "",
    `"${(r.companyName || "").replace(/"/g, '""')}"`,
    `"${(r.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="chateau-reserveringen-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
