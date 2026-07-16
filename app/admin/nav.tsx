"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS: Array<{ href: string; label: string; icon: ReactNode }> = [
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
  {
    href: "/admin/wines",
    label: "Wijnen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3h8l-1.2 8.2a3.6 3.6 0 0 1-3.6 3.1v0a3.6 3.6 0 0 1-3.6-3.1L8 3z" />
        <path d="M12 14.3V21M8.5 21h7" />
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
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={`a-nav-link${active ? " is-active" : ""}`}>
            <span className="a-nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
