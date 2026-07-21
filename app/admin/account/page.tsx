// app/admin/account/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listUsers } from "@/lib/db/users";
import { formatAdminDate } from "@/lib/format-date";
import { ChangePasswordForm } from "./change-password-form";
import { addUser, removeUser } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; password?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");

  const { error, created, password } = await searchParams;
  const users = await listUsers();

  return (
    <div>
      <h1 className="a-h1">Account</h1>
      <p className="a-subtitle">Ingelogd als {currentUser.email}.</p>

      <div style={{ marginTop: "1.5rem", maxWidth: "24rem" }} className="a-card">
        <div style={{ padding: "1.25rem" }}>
          <ChangePasswordForm />
        </div>
      </div>

      <div className="a-dashboard-section">
        <h2>Gebruikers</h2>

        {error ? (
          <p className="a-alert a-alert--danger" style={{ marginBottom: "1rem" }}>
            {error}
          </p>
        ) : null}

        {created && password ? (
          <div className="a-alert a-alert--success" style={{ marginBottom: "1rem" }}>
            <p style={{ margin: 0 }}>
              Account voor <strong>{created}</strong> aangemaakt. Geef dit tijdelijke wachtwoord door — het wordt
              hierna niet meer getoond:
            </p>
            <p style={{ margin: "0.5rem 0 0", fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: "1rem" }}>
              {password}
            </p>
          </div>
        ) : null}

        <div className="a-card" style={{ padding: "1.25rem" }}>
          <span className="a-label">Nieuw account toevoegen</span>
          <form action={addUser} style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <input
              required
              type="email"
              name="email"
              placeholder="collega@chateau.amsterdam"
              className="a-input"
              style={{ flex: "1 1 16rem" }}
            />
            <button type="submit" className="a-btn a-btn--primary">
              + Account toevoegen
            </button>
          </form>
        </div>

        <div className="a-card" style={{ marginTop: "1rem" }}>
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
                  <div className="a-label">
                    {user.email} {isSelf ? <span className="a-badge a-badge--neutral">Jij</span> : null}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "0.125rem" }}>
                    Sinds {formatAdminDate(user.createdAt.toISOString().slice(0, 10))}
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
                          : "Verwijderen"
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
