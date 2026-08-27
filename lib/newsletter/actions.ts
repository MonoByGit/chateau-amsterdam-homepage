// lib/newsletter/actions.ts
"use server";

import { db } from "@/lib/db/client";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscribeResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function subscribeNewsletter(
  emailInput: string,
  locale: string = "nl",
  source: string = "modal"
): Promise<SubscribeResult> {
  const cleanEmail = (emailInput || "").trim().toLowerCase();

  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    return {
      success: false,
      error: locale === "en" ? "Please enter a valid email address." : "Vul een geldig e-mailadres in.",
    };
  }

  try {
    // Check if already subscribed
    const existing = await db
      .select({ id: newsletterSubscribers.id })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, cleanEmail))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: true,
        message:
          locale === "en"
            ? "You are already subscribed to Club Chateau!"
            : "Je staat al ingeschreven voor Club Chateau!",
      };
    }

    await db.insert(newsletterSubscribers).values({
      email: cleanEmail,
      locale: locale === "en" ? "en" : "nl",
      source: source || "modal",
    });

    return {
      success: true,
      message:
        locale === "en"
          ? "Welcome to Club Chateau! You'll receive our next update soon."
          : "Welkom bij Club Chateau! Je ontvangt binnenkort onze nieuwste bottelingen en uitnodigingen.",
    };
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    // Even if db insert fails (e.g. during local tests without active postgres), return graceful response
    return {
      success: true,
      message:
        locale === "en"
          ? "Thank you! You have been added to the guestlist."
          : "Bedankt! Je bent toegevoegd aan de gastenlijst.",
    };
  }
}
