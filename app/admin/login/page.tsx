import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="a-login-shell">
      <div className="a-card a-login-card">
        <div className="a-login-mark">CA</div>
        <h1 className="a-h1" style={{ fontSize: "1.25rem", textAlign: "center", marginBottom: "1.5rem" }}>
          Chateau Amsterdam
        </h1>
        <Suspense fallback={<div style={{ textAlign: "center", padding: "1rem", color: "var(--a-text-2)" }}>Laden…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
