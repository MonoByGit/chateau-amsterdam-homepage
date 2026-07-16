"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1 text-sm">
        E-mailadres
        <input type="email" name="email" required autoComplete="username" className="border border-neutral-400 rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Wachtwoord
        <input type="password" name="password" required autoComplete="current-password" className="border border-neutral-400 rounded px-3 py-2" />
      </label>
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      <button type="submit" disabled={isPending} className="bg-neutral-900 text-white rounded px-4 py-2 disabled:opacity-50">
        {isPending ? "Bezig..." : "Inloggen"}
      </button>
    </form>
  );
}
