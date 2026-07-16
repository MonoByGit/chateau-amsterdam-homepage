// app/admin/wines/page.tsx
import Link from "next/link";
import { listWines } from "@/lib/db/wines";
import { deleteWine, reorderWines } from "./actions";

export default async function WinesListPage() {
  const wines = await listWines({});
  const orderedIds = wines.map((w) => w.id);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="a-h1">Wijnen</h1>
        <Link href="/admin/wines/new" className="a-btn a-btn--primary">
          + Nieuwe wijn
        </Link>
      </div>

      <div className="a-card" style={{ marginTop: "1.5rem" }}>
        {wines.length === 0 ? (
          <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
            Nog geen wijnen. Klik op &ldquo;Nieuwe wijn&rdquo; om te beginnen.
          </p>
        ) : (
          wines.map((wine, index) => (
            <div
              key={wine.id}
              className="a-card-row"
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                <form action={reorderWines.bind(null, orderedIds, wine.id, "up")}>
                  <button type="submit" disabled={index === 0} className="a-btn a-btn--ghost a-btn--icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 15l6-6 6 6" />
                    </svg>
                  </button>
                </form>
                <form action={reorderWines.bind(null, orderedIds, wine.id, "down")}>
                  <button type="submit" disabled={index === wines.length - 1} className="a-btn a-btn--ghost a-btn--icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </form>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="a-label">{wine.name}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "0.125rem" }}>
                  {wine.metaNl} · <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{wine.shopifyHandle}</span>
                </div>
              </div>

              <span className={`a-badge ${wine.isActive ? "a-badge--success" : "a-badge--neutral"}`}>
                {wine.isActive ? "Actief" : "Inactief"}
              </span>

              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href={`/admin/wines/${wine.id}`} className="a-link" style={{ fontSize: "0.8125rem" }}>
                  Bewerken
                </Link>
                <form action={deleteWine}>
                  <input type="hidden" name="id" value={wine.id} />
                  <button type="submit" className="a-btn a-btn--danger" style={{ padding: "0.125rem 0", fontSize: "0.8125rem" }}>
                    Verwijderen
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
