import { randomBytes } from "node:crypto";

// Shared by the CMS "add teammate" flow and the placeholder-account seed
// script — both need a one-time password the account holder is expected to
// change immediately, not something meant to be remembered.
export function generateTemporaryPassword(): string {
  return randomBytes(9).toString("base64url");
}
