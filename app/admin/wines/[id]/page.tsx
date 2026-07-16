// app/admin/wines/[id]/page.tsx
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Wijn bewerken</h1>
      <WineForm wine={wine} error={error} />
    </div>
  );
}
