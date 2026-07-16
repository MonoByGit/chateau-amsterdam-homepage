import "./admin.css";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/db/sessions";
import { findUserById } from "@/lib/db/users";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import { logout } from "./actions";

const NAV_ITEMS = [
  { href: "/admin/content", label: "Content" },
  { href: "/admin/wines", label: "Wijnen" },
  { href: "/admin/reservations", label: "Reserveringen" },
  { href: "/admin/availability", label: "Beschikbaarheid" },
  { href: "/admin/media", label: "Media" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await validateSession(token) : null;
  const user = session ? await findUserById(session.userId) : null;

  return (
    <html lang="nl">
      <body className="bg-neutral-50 text-neutral-900">
        <div className="min-h-screen flex">
          <nav className="w-56 border-r border-neutral-200 p-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="text-sm px-3 py-2 rounded hover:bg-neutral-200">
                {item.label}
              </a>
            ))}
            <form action={logout} className="mt-auto">
              <button type="submit" className="text-sm px-3 py-2 rounded hover:bg-neutral-200 w-full text-left">
                Uitloggen
              </button>
            </form>
          </nav>
          <div className="flex-1 flex flex-col">
            <header className="border-b border-neutral-200 px-6 py-3 text-sm text-neutral-500">
              {user ? `Ingelogd als ${user.email}` : null}
            </header>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
