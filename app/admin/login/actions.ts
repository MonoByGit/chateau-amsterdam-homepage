"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail, countUsers } from "@/lib/db/users";
import { createAuthCode, verifyAuthCode } from "@/lib/db/auth-codes";
import { createSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session-cookie";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";
import { sendLoginCodeEmail } from "@/lib/email/send";

export interface RequestCodeState {
  success: boolean;
  email?: string;
  expiresAt?: string;
  error?: string;
}

export interface VerifyCodeState {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  resetRequired?: boolean;
}

const ALLOWED_EMAIL_DOMAINS = ["chateau.amsterdam", "chateauamsterdam.nl"];
const ALLOWED_SPECIFIC_EMAILS = ["studio@monobydusty.com"];

export async function isEmailAuthorized(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];

  // 1. Explicitly allow trusted administrator emails
  if (ALLOWED_SPECIFIC_EMAILS.includes(normalized)) {
    return true;
  }

  // 2. Check if user already exists in DB
  const existingUser = await findUserByEmail(normalized);
  if (existingUser) return true;

  // 3. Allow if domain is chateau.amsterdam or chateauamsterdam.nl
  if (domain && ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return true;
  }

  // 4. Allow if no users exist in the system yet (bootstrap initial admin)
  const total = await countUsers();
  if (total === 0) return true;

  return false;
}

export async function requestLoginCode(
  _prevState: RequestCodeState | null,
  formData: FormData
): Promise<RequestCodeState> {
  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!rawEmail || !rawEmail.includes("@")) {
    return { success: false, error: "Vul een geldig e-mailadres in." };
  }

  const rateLimit = checkRateLimit(`code-req:${rawEmail}`);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterMs ?? 0) / 60000);
    return {
      success: false,
      error: `Te veel aanvragen. Wacht ${minutes} minuut/minuten voordat je een nieuwe code aanvraagt.`,
    };
  }

  const authorized = await isEmailAuthorized(rawEmail);
  if (!authorized) {
    recordFailedAttempt(`code-req:${rawEmail}`);
    return {
      success: false,
      error: "Dit e-mailadres heeft geen toegang tot het CMS. Vraag een beheerder om toegang.",
    };
  }

  try {
    const { code, magicToken, expiresAt } = await createAuthCode(rawEmail);
    await sendLoginCodeEmail({ email: rawEmail, code, magicToken });

    return {
      success: true,
      email: rawEmail,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (err) {
    console.error("[REQUEST LOGIN CODE ERROR]", err);
    return {
      success: false,
      error: "Er ging iets mis bij het versturen van de inlogcode. Probeer het opnieuw.",
    };
  }
}

export async function submitLoginCode(
  _prevState: VerifyCodeState | null,
  formData: FormData
): Promise<VerifyCodeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").replace(/\s+/g, "").trim();

  if (!email) {
    return { success: false, error: "E-mailadres ontbreekt.", resetRequired: true };
  }

  if (!code || code.length !== 6) {
    return { success: false, error: "Vul de volledige 6-cijferige code in." };
  }

  const result = await verifyAuthCode(email, code);

  if (!result.success) {
    if (result.reason === "invalid_code") {
      return {
        success: false,
        error: `Onjuiste code. Je hebt nog ${result.remainingAttempts} ${result.remainingAttempts === 1 ? "poging" : "pogingen"} over.`,
        remainingAttempts: result.remainingAttempts,
      };
    }

    if (result.reason === "max_attempts") {
      return {
        success: false,
        error: "Je hebt 3 keer een onjuiste code ingevoerd. Vraag een nieuwe code aan.",
        remainingAttempts: 0,
        resetRequired: true,
      };
    }

    if (result.reason === "expired") {
      return {
        success: false,
        error: "Deze code is verlopen (geldig voor 15 minuten). Vraag een nieuwe code aan.",
        remainingAttempts: 0,
        resetRequired: true,
      };
    }

    return {
      success: false,
      error: "Geen geldige code gevonden. Vraag een nieuwe code aan.",
      remainingAttempts: 0,
      resetRequired: true,
    };
  }

  // Valid! Create 30-day session
  const { token } = await createSession(result.user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  redirect("/admin");
}
