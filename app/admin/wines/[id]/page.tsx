// app/admin/wines/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWine } from "@/lib/db/wines";
import { WineForm } from "../wine-form";

export default async function EditWinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const wine = await getWine(id);
  if (!wine) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/wines" className="a-link" style={{ fontSize: "0.8125rem" }}>
        ← Wijnen
      </Link>
      <h1 className="a-h1" style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
        Wijn bewerken
      </h1>
      <WineForm wine={wine} error={error} />
    </div>
  );
}
