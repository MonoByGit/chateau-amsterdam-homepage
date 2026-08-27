// lib/content/popup-defaults.ts
import type { ContentPair } from "./get-content";

export type { ContentPair };

export type NewsletterPopupContent = {
  badge: ContentPair;
  heading: ContentPair;
  description: ContentPair;
  placeholder: ContentPair;
  button_label: ContentPair;
  disclaimer: ContentPair;
  success_heading: ContentPair;
  success_description: ContentPair;
  success_button: ContentPair;
  trigger_scroll: ContentPair;
  trigger_timer: ContentPair;
  dismiss_days: ContentPair;
};

export const NEWSLETTER_POPUP_DEFAULTS: NewsletterPopupContent = {
  badge: {
    nl: "CLUB CHATEAU · NIEUWS UIT DE WINERY",
    en: "CLUB CHATEAU · WINERY DISPATCHES",
  },
  heading: {
    nl: "Als eerste op de hoogte.",
    en: "Be the first to know.",
  },
  description: {
    nl: "Ontvang exclusieve kortingen, uitnodigingen voor proeverijen en leuke weetjes en verhalen uit onze winery aan het IJ.",
    en: "Receive exclusive discounts, invitations to tastings, and stories & wine facts from our winery on the IJ waterfront.",
  },
  placeholder: {
    nl: "Jouw e-mailadres",
    en: "Your email address",
  },
  button_label: {
    nl: "Aanmelden →",
    en: "Join Club →",
  },
  disclaimer: {
    nl: "Uitschrijven kan op elk gewenst moment met één klik.",
    en: "Unsubscribe anytime with one click.",
  },
  success_heading: {
    nl: "Je staat op de gastenlijst.",
    en: "You are on the guestlist.",
  },
  success_description: {
    nl: "Dank voor je aanmelding. Je ontvangt binnenkort uitnodigingen voor onze nieuwste bottelingen, proeverijen en events.",
    en: "Thank you for joining. You'll receive invitations for new releases, exclusive tastings and winery events.",
  },
  success_button: {
    nl: "Terug naar de winery",
    en: "Back to winery",
  },
  trigger_scroll: {
    nl: "50",
    en: "50",
  },
  trigger_timer: {
    nl: "30",
    en: "30",
  },
  dismiss_days: {
    nl: "14",
    en: "14",
  },
};

export type AgeGatePopupContent = {
  eyebrow: ContentPair;
  heading: ContentPair;
  description: ContentPair;
  btn_confirm: ContentPair;
  btn_deny: ContentPair;
};

export const AGE_GATE_POPUP_DEFAULTS: AgeGatePopupContent = {
  eyebrow: {
    nl: "Chateau Amsterdam",
    en: "Chateau Amsterdam",
  },
  heading: {
    nl: "Ben je 18 jaar of ouder?",
    en: "Are you 18 years or older?",
  },
  description: {
    nl: "Deze site gaat over wijn. Bevestig je leeftijd om verder te gaan.",
    en: "This site is about wine. Please confirm your age to continue.",
  },
  btn_confirm: {
    nl: "Ja, ik ben 18+",
    en: "Yes, I'm 18+",
  },
  btn_deny: {
    nl: "Nee",
    en: "No",
  },
};

export type CookieBannerPopupContent = {
  text: ContentPair;
  btn_accept: ContentPair;
  btn_settings: ContentPair;
};

export const COOKIE_BANNER_POPUP_DEFAULTS: CookieBannerPopupContent = {
  text: {
    nl: "We gebruiken alleen functionele en anonieme analytische cookies om de website soepel te laten werken. Geen tracking door derden.",
    en: "We only use functional and privacy-friendly analytics cookies to ensure a smooth experience. No third-party tracking.",
  },
  btn_accept: {
    nl: "Akkoord",
    en: "Accept",
  },
  btn_settings: {
    nl: "Instellingen",
    en: "Settings",
  },
};
