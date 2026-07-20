// app/admin/account/change-password-form.tsx
"use client";

import { useActionState, useRef } from "react";
import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const [result, formAction, isPending] = useActionState(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);
  const succeeded = result === "gelukt";

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="a-field"
      style={{ gap: "1rem" }}
    >
      <label className="a-field">
        <span className="a-label">Huidig wachtwoord</span>
        <input type="password" name="currentPassword" required autoComplete="current-password" className="a-input" />
      </label>
      <label className="a-field">
        <span className="a-label">Nieuw wachtwoord</span>
        <input type="password" name="newPassword" required autoComplete="new-password" minLength={10} className="a-input" />
        <span className="a-hint">Minstens 10 tekens.</span>
      </label>
      <label className="a-field">
        <span className="a-label">Herhaal nieuw wachtwoord</span>
        <input type="password" name="newPasswordRepeat" required autoComplete="new-password" minLength={10} className="a-input" />
      </label>
      {succeeded ? (
        <p className="a-alert a-alert--success">Wachtwoord gewijzigd.</p>
      ) : result ? (
        <p className="a-alert a-alert--danger">{result}</p>
      ) : null}
      <button type="submit" disabled={isPending} className="a-btn a-btn--primary" style={{ alignSelf: "flex-start" }}>
        {isPending ? "Bezig…" : "Wachtwoord wijzigen"}
      </button>
    </form>
  );
}
