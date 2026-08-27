// components/newsletter-modal.tsx
"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useLanguage } from "@/lib/language";
import { subscribeNewsletter } from "@/lib/newsletter/actions";
import {
  NEWSLETTER_POPUP_DEFAULTS,
  type NewsletterPopupContent,
} from "@/lib/content/popup-defaults";

const STORAGE_KEY_SUBSCRIBED = "chateau-newsletter-subscribed";
const STORAGE_KEY_DISMISSED = "chateau-newsletter-dismissed-at";

export function NewsletterModal({
  content = NEWSLETTER_POPUP_DEFAULTS,
}: {
  content?: NewsletterPopupContent;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLanguage();

  const dismissDays = parseInt(content.dismiss_days?.[lang] || "14", 10) || 14;
  const triggerScroll = parseInt(content.trigger_scroll?.[lang] || "50", 10) || 50;
  const triggerTimer = parseInt(content.trigger_timer?.[lang] || "30", 10) || 30;

  function isSuppressed(): boolean {
    if (typeof window === "undefined") return true;
    if (window.localStorage.getItem(STORAGE_KEY_SUBSCRIBED) === "true") return true;

    // Do not show if AgeGate has not been verified yet
    if (window.localStorage.getItem("age-verified") !== "yes") return true;

    const dismissedAt = window.localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < dismissDays) return true;
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

    // 2. Scroll depth trigger
    function handleScroll() {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 500) {
        const scrollPercent = (window.scrollY / scrollTotal) * 100;
        if (scrollPercent >= triggerScroll) {
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

    // 4. Timer trigger (after configured seconds of active browsing)
    const timer = setTimeout(() => {
      triggerAutoOpen();
    }, triggerTimer * 1000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("open-newsletter-modal", handleCustomOpen);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [triggerScroll, triggerTimer, dismissDays]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || isPending) return;

    setStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      const res = await subscribeNewsletter(email, lang);
      if (res.success) {
        setStatus("success");
        setSuccessMessage(res.message || "");
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY_SUBSCRIBED, "true");
        }
      } else {
        setStatus("error");
        setErrorMessage(res.message || "");
      }
    });
  }

  if (!isOpen) return null;

  const badgeText = content.badge?.[lang] || "CLUB CHATEAU · NIEUWS UIT DE WINERY";
  const headingText = content.heading?.[lang] || "Als eerste op de hoogte.";
  const descriptionText = content.description?.[lang] || "Ontvang exclusieve kortingen, uitnodigingen voor proeverijen en leuke weetjes en verhalen uit onze winery aan het IJ.";
  const placeholderText = content.placeholder?.[lang] || "Jouw e-mailadres";
  const buttonText = content.button_label?.[lang] || "Aanmelden →";
  const disclaimerText = content.disclaimer?.[lang] || "Uitschrijven kan op elk gewenst moment met één klik. Privacy gewaarborgd.";
  const successHeadingText = content.success_heading?.[lang] || "Je staat op de gastenlijst.";
  const successDescText = content.success_description?.[lang] || "Dank voor je aanmelding. Je ontvangt binnenkort uitnodigingen voor onze nieuwste bottelingen, proeverijen en events.";
  const successBtnText = content.success_button?.[lang] || "Terug naar de winery";

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
          {badgeText}
        </div>

        {status === "success" ? (
          <div className="newsletter-success-state">
            <div className="newsletter-success-icon">✓</div>
            <h2 id="newsletter-modal-title" className="newsletter-title">
              {successHeadingText}
            </h2>
            <p className="newsletter-description">
              {successMessage || successDescText}
            </p>
            <div className="newsletter-actions">
              <button type="button" className="btn btn--primary" onClick={handleClose}>
                {successBtnText}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="newsletter-modal-title" className="newsletter-title">
              {headingText}
            </h2>
            <p className="newsletter-description">
              {descriptionText}
            </p>

            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="newsletter-input-wrap">
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  placeholder={placeholderText}
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
                    : buttonText}
                </button>
              </div>

              {status === "error" && errorMessage && (
                <p className="newsletter-error-text">{errorMessage}</p>
              )}

              <p className="newsletter-disclaimer">
                {disclaimerText}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
