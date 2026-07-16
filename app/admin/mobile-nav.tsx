// app/admin/mobile-nav.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PRIMARY_ITEMS, SECONDARY_ITEMS, NavLink, isActive } from "./nav";
import { logout } from "./actions";

export function MobileNav({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer automatically on navigation, so tapping a link doesn't
  // leave the overlay open behind the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="a-mobile-bar">
      <span className="a-mobile-brand">Chateau Amsterdam</span>
      <button
        type="button"
        className="a-mobile-toggle"
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <div className="a-mobile-drawer-overlay" onClick={() => setOpen(false)}>
          <nav className="a-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="a-mobile-drawer-user">{userEmail}</div>
            {PRIMARY_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setOpen(false)} />
            ))}
            <div className="a-nav-section-label">Overig</div>
            {SECONDARY_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setOpen(false)} />
            ))}
            <form action={logout} style={{ marginTop: "0.5rem" }}>
              <button type="submit" className="a-nav-link" style={{ width: "100%", border: "none", background: "none" }}>
                <span className="a-nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" />
                    <path d="M10 8l-4 4 4 4M6 12h12" />
                  </svg>
                </span>
                Uitloggen
              </button>
            </form>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
