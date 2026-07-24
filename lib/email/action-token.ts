// lib/email/action-token.ts
import crypto from "crypto";

const SECRET = process.env.RESERVATION_ACTION_SECRET || process.env.SESSION_SECRET || "chateau_amsterdam_actionable_mail_secret_2026";

export function generateActionToken(reservationId: string, action: "approve" | "reject"): string {
  const data = `${reservationId}:${action}`;
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export function verifyActionToken(reservationId: string, action: "approve" | "reject", token: string): boolean {
  if (!reservationId || !action || !token) return false;
  const expected = generateActionToken(reservationId, action);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
