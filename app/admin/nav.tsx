"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon: ReactNode };

// Ordered by how often a small team actually opens each section, not by
// concept: reservations and availability change daily, homepage copy
// rarely. Landing on the least-used section first was itself part of the
// problem.
export const PRIMARY_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Overzicht",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2" />
        <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.2" />
        <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.2" />
        <rect x="13" y="13" width="7.5" height="7.5" rx="1.2" />
      </svg>
    ),
  },
  {
    href: "/admin/reservations",
    label: "Reserveringen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
        <path d="M3.5 9.5h17M8 3v3M16 3v3" />
        <path d="M8.5 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/admin/availability",
    label: "Beschikbaarheid",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
        <path d="M3.5 9.5h17M8 3v3M16 3v3" />
      </svg>
    ),
  },
  {
    href: "/admin/content",
    label: "Content",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    ),
  },
];

// Media isn't a task teams open on its own — it's a supporting library for
// content elsewhere in the CMS. Kept as a secondary, lower-priority link
// for the rare case of browsing everything that's been uploaded, not
// promoted alongside the daily-use sections.
export const SECONDARY_ITEMS: NavItem[] = [
  {
    href: "/admin/media",
    label: "Media",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M4 16.5 9 12l3 3 3.5-3.5L20.5 16" />
      </svg>
    ),
  },
  {
    href: "/admin/account",
    label: "Account",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
      </svg>
    ),
  },
  {
    href: "/admin/help",
    label: "Handleiding",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.3a2.5 2.5 0 0 1 4.85.9c0 1.7-2.35 2-2.35 3.3" />
        <path d="M12 17.2v.05" />
      </svg>
    ),
  },
];

export function isActive(pathname: string | null, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname?.startsWith(`${href}/`) || false;
}

export function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} className={`a-nav-link${active ? " is-active" : ""}`} onClick={onClick}>
      <span className="a-nav-icon">{item.icon}</span>
      {item.label}
    </Link>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {PRIMARY_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
      ))}
      <div className="a-nav-section-label">Overig</div>
      {SECONDARY_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
      ))}
    </>
  );
}
