// app/admin/account/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listUsers } from "@/lib/db/users";
import { formatAdminDate } from "@/lib/format-date";
import { addUser, removeUser } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");

  const { error, created } = await searchParams;
  const users = await listUsers();

  return (
    <div>
      <h1 className="a-h1">Toegangsbeheer</h1>
      <p className="a-subtitle">Ingelogd als <strong>{currentUser.email}</strong>.</p>

      {/* Passwordless Info Banner */}
      <div className="a-card" style={{ marginTop: "1.5rem", padding: "1.25rem", maxWidth: "38rem", background: "var(--a-surface-2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <div style={{ fontSize: "1.25rem", lineHeight: 1 }}>🔒</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--a-text)" }}>
              Wachtwoordloos Inloggen Actief
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "0.25rem", lineHeight: 1.45 }}>
              Alle gebruikers loggen in via een eenmalige 6-cijferige verificatiecode per e-mail (15 minuten geldig) of directe inloglink. Niemand hoeft meer een wachtwoord te onthouden of door te geven.
            </div>
          </div>
        </div>
      </div>

      <div className="a-dashboard-section" style={{ marginTop: "2rem" }}>
        <h2>Gebruikers met CMS-toegang</h2>

        {error ? (
          <p className="a-alert a-alert--danger" style={{ marginBottom: "1rem", maxWidth: "38rem" }}>
            {error}
          </p>
        ) : null}

        {created ? (
          <div className="a-alert a-alert--success" style={{ marginBottom: "1rem", maxWidth: "38rem" }}>
            <p style={{ margin: 0 }}>
              Account voor <strong>{created}</strong> toegevoegd! Deze collega kan nu direct naar het inlogscherm gaan en inloggen met een e-mailcode.
            </p>
          </div>
        ) : null}

        <div className="a-card" style={{ padding: "1.25rem", maxWidth: "38rem" }}>
          <span className="a-label">Nieuwe collega toevoegen</span>
          <form action={addUser} style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <input
              required
              type="email"
              name="email"
              placeholder="collega@chateauamsterdam.nl"
              className="a-input"
              style={{ flex: "1 1 16rem" }}
            />
            <button type="submit" className="a-btn a-btn--primary">
              + Toegang verlenen
            </button>
          </form>
        </div>

        <div className="a-card" style={{ marginTop: "1rem", maxWidth: "38rem" }}>
          {users.map((user) => {
            const isSelf = user.id === currentUser.id;
            const isLastUser = users.length <= 1;
            return (
              <div
                key={user.id}
                className="a-card-row"
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="a-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{user.email}</span>
                    {isSelf ? <span className="a-badge a-badge--neutral">Jij</span> : null}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "0.125rem" }}>
                    Toegang sinds {formatAdminDate(user.createdAt.toISOString().slice(0, 10))}
                  </div>
                </div>

                <form action={removeUser}>
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="a-icon-btn a-icon-btn--danger"
                    disabled={isSelf || isLastUser}
                    aria-label={`${user.email} verwijderen`}
                    title={
                      isSelf
                        ? "Je kunt je eigen account niet verwijderen"
                        : isLastUser
                          ? "Het laatste account kan niet verwijderd worden"
                          : "Toegang intrekken"
                    }
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
                    </svg>
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
