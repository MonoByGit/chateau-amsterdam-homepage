// app/admin/wines/new/page.tsx
import Link from "next/link";
import { WineForm } from "../wine-form";

export default async function NewWinePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <Link href="/admin/wines" className="a-link" style={{ fontSize: "0.8125rem" }}>
        ← Wijnen
      </Link>
      <h1 className="a-h1" style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
        Nieuwe wijn
      </h1>
      <WineForm wine={null} error={error} />
    </div>
  );
}
