// components/newsletter-modal.tsx
"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useLanguage } from "@/lib/language";
import { subscribeNewsletter } from "@/lib/newsletter/actions";

const STORAGE_KEY_SUBSCRIBED = "chateau-newsletter-subscribed";
const STORAGE_KEY_DISMISSED = "chateau-newsletter-dismissed-at";
const DISMISS_SUPPRESSION_DAYS = 14;

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLanguage();

  function isSuppressed(): boolean {
    if (typeof window === "undefined") return true;
    if (window.localStorage.getItem(STORAGE_KEY_SUBSCRIBED) === "true") return true;

    // Do not show if AgeGate has not been verified yet
    if (window.localStorage.getItem("age-verified") !== "yes") return true;

    const dismissedAt = window.localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < DISMISS_SUPPRESSION_DAYS) return true;
    }
    return false;
  }

  function handleClose() {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
    }
  }

  function handleOpen() {
    setStatus("idle");
    setErrorMessage("");
    setIsOpen(true);
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  }

  useEffect(() => {
    // 1. Listen for manual trigger events from links/buttons across the site
    function handleCustomOpen() {
      handleOpen();
    }
    window.addEventListener("open-newsletter-modal", handleCustomOpen);

    if (isSuppressed()) {
      return () => window.removeEventListener("open-newsletter-modal", handleCustomOpen);
    }

    let hasTriggered = false;

    function triggerAutoOpen() {
      if (hasTriggered || isSuppressed()) return;
      hasTriggered = true;
      handleOpen();
    }

    // 2. Scroll depth trigger (after 50% scroll)
    function handleScroll() {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 600) {
        const scrollPercent = (window.scrollY / scrollTotal) * 100;
        if (scrollPercent >= 50) {
          triggerAutoOpen();
        }
      }
    }

    // 3. Exit intent trigger on desktop (mouse leaves top of screen)
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 15 && e.relatedTarget === null) {
        triggerAutoOpen();
      }
    }

    // 4. Timer trigger (after 30 seconds of active browsing)
    const timer = setTimeout(() => {
      triggerAutoOpen();
    }, 30000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("open-newsletter-modal", handleCustomOpen);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMessage("");
    startTransition(async () => {
      const res = await subscribeNewsletter(email, lang, "popup");
      if (res.success) {
        setStatus("success");
        setSuccessMessage(res.message || t("Welkom bij Club Chateau!", "Welcome to Club Chateau!"));
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY_SUBSCRIBED, "true");
        }
      } else {
        setStatus("error");
        setErrorMessage(res.error || t("Er is iets misgegaan.", "Something went wrong."));
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div
      className="newsletter-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
    >
      <div className="newsletter-card" ref={modalRef}>
        <button
          type="button"
          className="newsletter-close"
          onClick={handleClose}
          aria-label={t("Sluiten", "Close")}
        >
          ✕
        </button>

        <div className="newsletter-badge">
          <span className="newsletter-badge-dot" />
          {t("CLUB CHATEAU · NIEUWS UIT DE WINERY", "CLUB CHATEAU · WINERY DISPATCHES")}
        </div>

        {status === "success" ? (
          <div className="newsletter-success-state">
            <div className="newsletter-success-icon">✓</div>
            <h2 id="newsletter-modal-title" className="newsletter-title">
              {t("Je staat op de gastenlijst.", "You are on the guestlist.")}
            </h2>
            <p className="newsletter-description">
              {successMessage ||
                t(
                  "Dank voor je aanmelding. Je ontvangt binnenkort uitnodigingen voor onze nieuwste bottelingen, proeverijen en events.",
                  "Thank you for joining. You'll receive invitations for new releases, exclusive tastings and winery events."
                )}
            </p>
            <div className="newsletter-actions">
              <button type="button" className="btn btn--primary" onClick={handleClose}>
                {t("Terug naar de winery", "Back to winery")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="newsletter-modal-title" className="newsletter-title">
              {t(
                "Als eerste op de hoogte.",
                "Be the first to know."
              )}
            </h2>
            <p className="newsletter-description">
              {t(
                "Ontvang exclusieve kortingen, uitnodigingen voor proeverijen en leuke weetjes en verhalen uit onze winery aan het IJ.",
                "Receive exclusive discounts, invitations to tastings, and stories & wine facts from our winery on the IJ waterfront."
              )}
            </p>

            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="newsletter-input-wrap">
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  placeholder={t("Jouw e-mailadres", "Your email address")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  disabled={isPending}
                />
                <button
                  type="submit"
                  className="btn btn--primary newsletter-submit-btn"
                  disabled={isPending || !email.trim()}
                >
                  {isPending
                    ? t("Aanmelden...", "Subscribing...")
                    : t("Aanmelden →", "Join Club →")}
                </button>
              </div>

              {status === "error" && errorMessage && (
                <p className="newsletter-error-text">{errorMessage}</p>
              )}

              <p className="newsletter-disclaimer">
                {t(
                  "Uitschrijven kan op elk gewenst moment met één klik. Privacy gewaarborgd.",
                  "Unsubscribe anytime with one click. Privacy guaranteed."
                )}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
