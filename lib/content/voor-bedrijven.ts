// lib/content/voor-bedrijven.ts
import type { ContentPair } from "@/lib/content/get-content";

export type SelectOption = { key: string; nl: string; en: string };

export type Service = {
  key: string;
  img: string;
  alt: ContentPair;
  title: ContentPair;
  body: ContentPair;
  occasion: SelectOption;
};

// occasion.nl is what gets submitted/stored (see lib/db/reservations.ts
// createBusinessReservation) so admin/reservations keeps reading plain
// Dutch text regardless of the visitor's chosen language.
export const SERVICES: Service[] = [
  {
    key: "tastings",
    img: "/assets/hero-winery.jpg",
    alt: { nl: "Borrel tussen de tanks", en: "Drinks between the tanks" },
    title: { nl: "Tastings & borrels", en: "Tastings & drinks" },
    body: {
      nl: "Zet je team tussen de tanks. Van 10 tot 60 personen, met of zonder bites erbij.",
      en: "Put your team between the tanks. From 10 to 60 guests, with or without bites.",
    },
    occasion: { key: "tastings", nl: "Zakelijke tasting of borrel", en: "Corporate tasting or drinks" },
  },
  {
    key: "private_label",
    img: "/assets/step-druif.jpg",
    alt: { nl: "Druiven voor private label", en: "Grapes for private label" },
    title: { nl: "Private label & relatiegeschenken", en: "Private label & corporate gifts" },
    body: {
      nl: "Jullie naam op de fles. Wij vinifiëren, jij bepaalt het etiket en het verhaal erachter.",
      en: "Your name on the bottle. We vinify, you decide the label and the story behind it.",
    },
    occasion: { key: "private_label", nl: "Private label / relatiegeschenk", en: "Private label / corporate gift" },
  },
  {
    key: "events",
    img: "/assets/step-makerij.jpg",
    alt: { nl: "Event in de winery-hal", en: "Event in the winery hall" },
    title: { nl: "Events & locatieverhuur", en: "Events & venue rental" },
    body: {
      nl: "De winery als decor. 20 tot 150 gasten, inclusief bar, geluid en sfeer.",
      en: "The winery as your backdrop. 20 to 150 guests, including bar, sound and atmosphere.",
    },
    occasion: { key: "events", nl: "Event of locatieverhuur", en: "Event or venue rental" },
  },
  {
    key: "wholesale",
    img: "/assets/step-fles.jpg",
    alt: { nl: "Groothandel levering", en: "Wholesale delivery" },
    title: { nl: "Groothandel voor horeca", en: "Wholesale for hospitality" },
    body: {
      nl: "Vaste plek op de kaart. Staffelkorting vanaf de eerste doos, altijd op voorraad.",
      en: "A permanent spot on the menu. Volume discount from the first case, always in stock.",
    },
    occasion: { key: "wholesale", nl: "Groothandel voor horeca", en: "Wholesale for hospitality" },
  },
];

export const OCCASIONS: SelectOption[] = [
  ...SERVICES.map((s) => s.occasion),
  { key: "other", nl: "Iets anders", en: "Something else" },
];

export const BUSINESS_ERROR_MESSAGES: Record<string, ContentPair> = {
  name_required: { nl: "Naam is verplicht.", en: "Name is required." },
  email_required: { nl: "E-mailadres is verplicht.", en: "Email address is required." },
  email_invalid: { nl: "Vul een geldig e-mailadres in.", en: "Enter a valid email address." },
  occasion_required: { nl: "Kies een onderwerp.", en: "Choose a subject." },
  group_size_invalid: { nl: "Vul een geldig aantal personen in.", en: "Enter a valid number of guests." },
  rate_limited: {
    nl: "Te veel aanvragen vanaf dit e-mailadres. Probeer het over een kwartier opnieuw.",
    en: "Too many requests from this email address. Please try again in 15 minutes.",
  },
};

export const VOOR_BEDRIJVEN_COPY = {
  breadcrumbHome: { nl: "Home", en: "Home" },
  breadcrumbCurrent: { nl: "Voor bedrijven", en: "For businesses" },
  introLabel: { nl: "Zakelijk & horeca", en: "Business & hospitality" },
  introHeadingLead: { nl: "Wijn die je bedrijf een", en: "Wine that gives your business a" },
  introHeadingEm: { nl: "verhaal", en: "story" },
  introHeadingTail: { nl: "geeft", en: "" },
  introBody: {
    nl: "Van de borrel tussen de tanks tot je naam op de fles. Eén partner, geproduceerd tien minuten van Amsterdam CS. Kies hieronder waar je aan denkt, wij nemen het van daar over.",
    en: "From drinks between the tanks to your name on the bottle. One partner, produced ten minutes from Amsterdam Central. Pick what you're thinking of below, we'll take it from there.",
  },
  introPhotoAlt: { nl: "Lange gedekte tafel met kaarslicht in de winery-hal", en: "Long set table with candlelight in the winery hall" },
  stripContactLabel: { nl: "Aanspreekpunt, van begin tot levering", en: "One point of contact, from start to delivery" },
  stripDistance: { nl: "10 min", en: "10 min" },
  stripDistanceLabel: { nl: "Van Amsterdam CS, midden in Noord", en: "From Amsterdam Central, in the heart of Noord" },
  stripProducedLabel: { nl: "Geproduceerd in de eigen winery", en: "Produced in our own winery" },
  indexLabel: { nl: "Vier manieren, één aanspreekpunt", en: "Four ways, one point of contact" },
  formLabel: { nl: "Aanvraag", en: "Request" },
  formHeading: { nl: "Vertel ons waar je aan denkt.", en: "Tell us what you have in mind." },
  formSuccess: { nl: "Bedankt. We nemen zo snel mogelijk contact op.", en: "Thanks. We'll be in touch as soon as possible." },
  formIntro: { nl: "Eén formulier, rechtstreeks bij het team.", en: "One form, straight to the team." },
  fieldOccasion: { nl: "Onderwerp", en: "Subject" },
  fieldName: { nl: "Naam", en: "Name" },
  fieldNamePlaceholder: { nl: "Voor- en achternaam", en: "First and last name" },
  fieldCompany: { nl: "Bedrijf", en: "Company" },
  fieldCompanyPlaceholder: { nl: "Bedrijfsnaam", en: "Company name" },
  fieldEmail: { nl: "E-mail", en: "Email" },
  fieldEmailPlaceholder: { nl: "naam@bedrijf.nl", en: "name@company.com" },
  fieldPhone: { nl: "Telefoon (optioneel)", en: "Phone (optional)" },
  fieldPhonePlaceholder: { nl: "06 12345678", en: "06 12345678" },
  fieldGroupSize: { nl: "Aantal personen (optioneel)", en: "Number of guests (optional)" },
  fieldGroupSizePlaceholder: { nl: "Bijvoorbeeld 25", en: "For example 25" },
  fieldNotes: { nl: "Vertel iets over je aanvraag", en: "Tell us about your request" },
  fieldNotesPlaceholder: { nl: "Waar denk je aan?", en: "What do you have in mind?" },
  submit: { nl: "Versturen →", en: "Send →" },
  formNote: { nl: "We reageren binnen 1 werkdag.", en: "We respond within 1 business day." },
} satisfies Record<string, ContentPair>;
