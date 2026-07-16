// app/admin/wines/page.tsx
import Link from "next/link";
import { listWines } from "@/lib/db/wines";
import { deleteWine, reorderWines } from "./actions";

export default async function WinesListPage() {
  const wines = await listWines({});
  const orderedIds = wines.map((w) => w.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Wijnen</h1>
        <Link
          href="/admin/wines/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Nieuwe wijn
        </Link>
      </div>
      <table className="w-full divide-y divide-neutral-200 text-sm">
        <thead>
          <tr className="text-left text-neutral-500">
            <th className="py-2">Volgorde</th>
            <th className="py-2">Naam</th>
            <th className="py-2">Actief</th>
            <th className="py-2">Shopify</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {wines.map((wine, index) => (
            <tr key={wine.id}>
              <td className="py-2">
                <div className="flex gap-1">
                  <form action={reorderWines.bind(null, orderedIds, wine.id, "up")}>
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="rounded border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={reorderWines.bind(null, orderedIds, wine.id, "down")}>
                    <button
                      type="submit"
                      disabled={index === wines.length - 1}
                      className="rounded border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                </div>
              </td>
              <td className="py-2">{wine.name}</td>
              <td className="py-2">{wine.isActive ? "Ja" : "Nee"}</td>
              <td className="py-2">{wine.shopifyHandle}</td>
              <td className="py-2">
                <div className="flex gap-3">
                  <Link href={`/admin/wines/${wine.id}`} className="text-neutral-600 hover:underline">
                    Bewerken
                  </Link>
                  <form action={deleteWine}>
                    <input type="hidden" name="id" value={wine.id} />
                    <button type="submit" className="text-red-600 hover:underline">
                      Verwijderen
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
