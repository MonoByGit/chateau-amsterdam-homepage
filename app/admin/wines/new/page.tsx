// app/admin/wines/new/page.tsx
import { WineForm } from "../wine-form";

export default async function NewWinePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Nieuwe wijn</h1>
      <WineForm wine={null} error={error} />
    </div>
  );
}
