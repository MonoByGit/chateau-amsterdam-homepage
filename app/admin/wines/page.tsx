// app/admin/wines/page.tsx
import Link from "next/link";
import { listWines } from "@/lib/db/wines";
import { WinesList } from "./wines-list";

export default async function WinesListPage() {
  const wines = await listWines({});

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="a-h1">Wijnen</h1>
        <Link href="/admin/wines/new" className="a-btn a-btn--primary">
          + Nieuwe wijn
        </Link>
      </div>
      <p className="a-subtitle">Sleep aan de handgreep om de volgorde op de site aan te passen.</p>

      <div style={{ marginTop: "1.5rem" }}>
        <WinesList wines={wines} />
      </div>
    </div>
  );
}
