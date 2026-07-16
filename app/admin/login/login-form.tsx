"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="a-field" style={{ gap: "1rem" }}>
      <label className="a-field">
        <span className="a-label">E-mailadres</span>
        <input type="email" name="email" required autoComplete="username" className="a-input" />
      </label>
      <label className="a-field">
        <span className="a-label">Wachtwoord</span>
        <input type="password" name="password" required autoComplete="current-password" className="a-input" />
      </label>
      {error ? <p className="a-alert a-alert--danger">{error}</p> : null}
      <button type="submit" disabled={isPending} className="a-btn a-btn--primary" style={{ width: "100%", padding: "0.625rem" }}>
        {isPending ? "Bezig…" : "Inloggen"}
      </button>
    </form>
  );
}
