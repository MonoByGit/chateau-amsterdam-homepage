// lib/content/tours-tastings.ts
import type { ContentPair } from "@/lib/content/get-content";

export type SelectOption = { key: string; nl: string; en: string };

// value submitted to the server (and stored in reservations.preferred_period)
// is always option.nl, so admin/reservations keeps reading plain Dutch text
// regardless of which language the visitor filled the form in.
export const PREFERRED_PERIODS: SelectOption[] = [
  { key: "no_preference", nl: "Geen voorkeur", en: "No preference" },
  { key: "friday_afternoon", nl: "Vrijdagmiddag", en: "Friday afternoon" },
  { key: "friday_evening", nl: "Vrijdagavond", en: "Friday evening" },
  { key: "saturday_afternoon", nl: "Zaterdagmiddag", en: "Saturday afternoon" },
  { key: "saturday_evening", nl: "Zaterdagavond", en: "Saturday evening" },
];

export const OCCASIONS: SelectOption[] = [
  { key: "none", nl: "Geen speciale gelegenheid", en: "No special occasion" },
  { key: "birthday", nl: "Verjaardag", en: "Birthday" },
  { key: "date_night", nl: "Date night", en: "Date night" },
  { key: "friend_group", nl: "Vriendengroep", en: "Group of friends" },
  { key: "team_outing", nl: "Teamuitje", en: "Team outing" },
  { key: "other", nl: "Anders", en: "Other" },
];

export const TASTING_ERROR_MESSAGES: Record<string, ContentPair> = {
  name_required: { nl: "Naam is verplicht.", en: "Name is required." },
  email_required: { nl: "E-mailadres is verplicht.", en: "Email address is required." },
  email_invalid: { nl: "Vul een geldig e-mailadres in.", en: "Enter a valid email address." },
  party_size_invalid: {
    nl: "Vul een geldig aantal personen in (max. 20).",
    en: "Enter a valid number of guests (max. 20).",
  },
  date_required: { nl: "Kies een datum.", en: "Choose a date." },
  date_invalid: { nl: "Kies een geldige datum.", en: "Choose a valid date." },
  date_past: { nl: "Kies een datum in de toekomst.", en: "Choose a date in the future." },
  rate_limited: {
    nl: "Te veel aanvragen vanaf dit e-mailadres. Probeer het over een kwartier opnieuw.",
    en: "Too many requests from this email address. Please try again in 15 minutes.",
  },
};

export const TOURS_TASTINGS_COPY = {
  heroAlt: { nl: "Interieur van de winery, tanks en vaten in avondlicht", en: "Interior of the winery, tanks and barrels in evening light" },
  breadcrumbHome: { nl: "Home", en: "Home" },
  breadcrumbCurrent: { nl: "Tour & tasting", en: "Tour & tasting" },
  heroLabel: { nl: "Ontdek Chateau", en: "Discover Chateau" },
  heroTitleLead: { nl: "Tour &", en: "Tour &" },
  heroTitleEm: { nl: "tasting", en: "tasting" },
  heroSub: {
    nl: "70 minuten tussen de tanks. Zes wijnen op tafel. Een middag die je proeft in plaats van leest.",
    en: "70 minutes between the tanks. Six wines on the table. An afternoon you taste, not read.",
  },
  scroll: { nl: "Scroll", en: "Scroll" },
  openingLine1: { nl: "Midden in de stad wordt hier wijn gemaakt, van tank tot glas.", en: "In the middle of the city, wine is made here, from tank to glass." },
  openingLine2: { nl: "Wij laten je proeven wat er ontstaat.", en: "We let you taste what it becomes." },
  tourNum: { nl: "01 — De tour", en: "01 — The tour" },
  tourHeading: { nl: "Tussen de tanks", en: "Between the tanks" },
  tourBody: {
    nl: "Een tour van 70 minuten door de winery. Je ziet hoe de druiven hier worden verwerkt tot wijn, van tank tot fles, en hoort het verhaal achter Chateau Amsterdam.",
    en: "A 70-minute tour through the winery. See how the grapes here become wine, from tank to bottle, and hear the story behind Chateau Amsterdam.",
  },
  tourMainAlt: { nl: "Winemaker controleert wijn tussen de RVS tanks", en: "Winemaker checking wine among the steel tanks" },
  grapesAlt: { nl: "Handen die druiven sorteren", en: "Hands sorting grapes" },
  tastingNum: { nl: "02 — De tasting", en: "02 — The tasting" },
  tastingHeading: { nl: "Zes wijnen, één tafel", en: "Six wines, one table" },
  tastingBody: {
    nl: "Na de tour proef je 6 wijnen met een kleine snack erbij. Dieetwensen of allergieën? Laat het weten bij je aanvraag, dan houden we er rekening mee.",
    en: "After the tour you taste 6 wines with a small bite alongside. Dietary needs or allergies? Let us know in your request and we'll take care of it.",
  },
  tastingMainAlt: { nl: "Proeverij van vier wijnen met bites op een wijnvat", en: "Tasting of four wines with bites on a wine barrel" },
  stripDuration: { nl: "70 min", en: "70 min" },
  stripDurationLabel: { nl: "Tour & tasting samen", en: "Tour & tasting together" },
  stripWines: { nl: "6", en: "6" },
  stripWinesLabel: { nl: "Wijnen om te proeven", en: "Wines to taste" },
  stripDiscount: { nl: "20%", en: "20%" },
  stripDiscountLabel: { nl: "Korting in de winkel nadien", en: "Discount in the shop afterwards" },
  stripPrice: { nl: "€55", en: "€55" },
  stripPriceLabel: { nl: "Per persoon", en: "Per person" },
  reserveMediaAlt: { nl: "Chateau Amsterdam bij avond, aan het water", en: "Chateau Amsterdam at night, by the water" },
  reserveLabel: { nl: "Reserveren", en: "Reserve" },
  reserveHeading: { nl: "Boek je plek tussen de tanks.", en: "Book your spot between the tanks." },
  reserveSub: { nl: "We bevestigen je aanvraag persoonlijk.", en: "We confirm your request personally." },
  formSuccess: { nl: "Bedankt voor je aanvraag. We nemen zo snel mogelijk contact op.", en: "Thanks for your request. We'll be in touch as soon as possible." },
  fieldPartySize: { nl: "Aantal personen", en: "Number of guests" },
  partySizeDecrease: { nl: "Minder personen", en: "Fewer guests" },
  partySizeIncrease: { nl: "Meer personen", en: "More guests" },
  fieldDate: { nl: "Datum", en: "Date" },
  datePlaceholder: { nl: "Kies een datum", en: "Choose a date" },
  datePrevMonth: { nl: "Vorige maand", en: "Previous month" },
  dateNextMonth: { nl: "Volgende maand", en: "Next month" },
  dateToday: { nl: "Vandaag", en: "Today" },
  fieldPeriod: { nl: "Voorkeursmoment", en: "Preferred time" },
  fieldOccasion: { nl: "Gelegenheid (optioneel)", en: "Occasion (optional)" },
  fieldName: { nl: "Naam", en: "Name" },
  fieldNamePlaceholder: { nl: "Voor- en achternaam", en: "First and last name" },
  fieldEmail: { nl: "E-mailadres", en: "Email address" },
  fieldEmailPlaceholder: { nl: "naam@voorbeeld.nl", en: "name@example.com" },
  fieldPhone: { nl: "Telefoonnummer", en: "Phone number" },
  fieldPhonePlaceholder: { nl: "06 12345678", en: "06 12345678" },
  fieldNotes: { nl: "Allergieën, dieetwensen of opmerkingen", en: "Allergies, dietary needs or comments" },
  fieldNotesPlaceholder: {
    nl: "Bijvoorbeeld: notenallergie, vegetarisch, of iets anders dat we moeten weten.",
    en: "For example: nut allergy, vegetarian, or anything else we should know.",
  },
  submit: { nl: "Verstuur aanvraag", en: "Send request" },
  note: {
    nl: "Met een groep groter dan 20 personen? Neem contact op voor een groepsaanbod op maat.",
    en: "Group larger than 20? Get in touch for a tailored group offer.",
  },
} satisfies Record<string, ContentPair>;
