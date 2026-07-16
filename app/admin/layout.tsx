import "./admin.css";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/db/sessions";
import { findUserById } from "@/lib/db/users";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import { AdminNav } from "./nav";
import { MobileNav } from "./mobile-nav";
import { logout } from "./actions";

// Same type family as the public site (app/(site)/layout.tsx), loaded
// separately here because /admin has its own independent root layout —
// this keeps the admin visually part of the same brand, not a generic tool.
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await validateSession(token) : null;
  const user = session ? await findUserById(session.userId) : null;

  if (!user) {
    return (
      <html lang="nl" className={`${archivo.variable} ${ibmPlexMono.variable}`}>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="nl" className={`${archivo.variable} ${ibmPlexMono.variable}`}>
      <body>
        <MobileNav userEmail={user.email} />
        <div className="a-shell">
          <aside className="a-sidebar">
            <div className="a-brand">Chateau Amsterdam</div>
            <AdminNav />
            <div className="a-sidebar-footer">
              <form action={logout}>
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
            </div>
          </aside>
          <div className="a-main">
            <header className="a-topbar">
              <span>Ingelogd als {user.email}</span>
            </header>
            <main className="a-content" style={{ maxWidth: "none" }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
