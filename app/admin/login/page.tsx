import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="a-login-shell">
      <div className="a-card a-login-card">
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <img
            src="/assets/chateau-logo.png"
            alt="Chateau Amsterdam"
            className="a-login-logo"
          />
          <div
            style={{
              fontFamily: "var(--font-ibm-plex-mono, monospace)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--a-text-3)",
              marginTop: "0.5rem",
            }}
          >
            CMS &middot; Urban Winery
          </div>
        </div>

        <Suspense fallback={<div style={{ textAlign: "center", padding: "1rem", color: "var(--a-text-2)" }}>Laden…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
