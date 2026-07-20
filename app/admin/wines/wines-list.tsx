// app/admin/wines/wines-list.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Wine } from "@/lib/db/wines";
import { LightboxImage } from "@/components/admin/lightbox";
import { deleteWine, reorderWinesTo } from "./actions";

type WineWithImage = Wine & { imageUrl: string | null; imageAlt: string };

export function WinesList({ wines: initialWines }: { wines: WineWithImage[] }) {
  const [wines, setWines] = useState(initialWines);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function commitOrder(next: WineWithImage[]) {
    setWines(next);
    startTransition(() => {
      reorderWinesTo(next.map((w) => w.id));
    });
  }

  function moveTo(fromId: string, toIndex: number) {
    const from = wines.findIndex((w) => w.id === fromId);
    if (from === -1 || toIndex < 0 || toIndex >= wines.length || from === toIndex) return;

    const next = [...wines];
    const [moved] = next.splice(from, 1);
    next.splice(toIndex, 0, moved);
    commitOrder(next);
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    const to = wines.findIndex((w) => w.id === targetId);
    setDraggingId(null);
    if (to !== -1) moveTo(draggingId, to);
  }

  // Native HTML5 drag-and-drop isn't operable by keyboard or screen reader,
  // arrow keys on the handle move the row by one position using the same
  // reorder action, so reordering doesn't depend on being able to drag.
  function handleHandleKeyDown(e: React.KeyboardEvent, id: string) {
    const index = wines.findIndex((w) => w.id === id);
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveTo(id, index - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveTo(id, index + 1);
    }
  }

  if (wines.length === 0) {
    return (
      <div className="a-card">
        <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
          Nog geen wijnen. Klik op &ldquo;Nieuwe wijn&rdquo; om te beginnen.
        </p>
      </div>
    );
  }

  return (
    <div className="a-card">
      {wines.map((wine) => (
        <div
          key={wine.id}
          className={`a-card-row a-drag-row${draggingId === wine.id ? " is-dragging" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          draggable
          onDragStart={() => setDraggingId(wine.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(wine.id)}
          onDragEnd={() => setDraggingId(null)}
        >
          <button
            type="button"
            className="a-drag-handle"
            aria-label={`Verplaats ${wine.name}, gebruik de pijltjestoetsen om te herordenen`}
            title="Sleep, of gebruik de pijltjestoetsen, om te herordenen"
            onKeyDown={(e) => handleHandleKeyDown(e, wine.id)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <circle cx="9" cy="6" r="1.4" />
              <circle cx="15" cy="6" r="1.4" />
              <circle cx="9" cy="12" r="1.4" />
              <circle cx="15" cy="12" r="1.4" />
              <circle cx="9" cy="18" r="1.4" />
              <circle cx="15" cy="18" r="1.4" />
            </svg>
          </button>

          {wine.imageUrl ? (
            <LightboxImage src={wine.imageUrl} alt={wine.imageAlt} className="a-thumb" />
          ) : (
            <div className="a-thumb a-thumb--empty" aria-hidden="true" />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="a-label">{wine.name}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "0.125rem" }}>
              {wine.metaNl} ·{" "}
              <span style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{wine.shopifyHandle}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.375rem" }}>
            <span className={`a-badge ${wine.isActive ? "a-badge--success" : "a-badge--neutral"}`}>
              {wine.isActive ? "Actief" : "Inactief"}
            </span>
            {wine.showOnHomepage ? <span className="a-badge a-badge--neutral">Homepage</span> : null}
          </div>

          <div className="a-row-actions">
            <Link href={`/admin/wines/${wine.id}`} className="a-icon-btn" aria-label={`${wine.name} bewerken`} title="Bewerken">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </Link>
            <form action={deleteWine}>
              <input type="hidden" name="id" value={wine.id} />
              <button type="submit" className="a-icon-btn a-icon-btn--danger" aria-label={`${wine.name} verwijderen`} title="Verwijderen">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
