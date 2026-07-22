// lib/content/defaults.ts
import type { ContentPair } from "@/lib/content/get-content";

export type { ContentPair };

export type HeaderContent = {
  nav_1_label: ContentPair;
  nav_2_label: ContentPair;
  nav_3_label: ContentPair;
  nav_4_label: ContentPair;
  nav_5_label: ContentPair;
  cta_label: ContentPair;
};

export const HEADER_DEFAULTS: HeaderContent = {
  nav_1_label: { nl: "Verhaal", en: "Story" },
  nav_2_label: { nl: "Proces", en: "Process" },
  nav_3_label: { nl: "Wijn", en: "Wine" },
  nav_4_label: { nl: "Bedrijf", en: "Business" },
  nav_5_label: { nl: "Bezoek", en: "Visit" },
  cta_label: { nl: "Boek een tasting", en: "Book a tasting" },
};

export type HeroContent = {
  eyebrow_3: ContentPair;
  script_tagline: ContentPair;
  intro_lead: ContentPair;
  intro_em: ContentPair;
  cta_primary: ContentPair;
  cta_secondary: ContentPair;
  media_caption: ContentPair;
};

export const HERO_DEFAULTS: HeroContent = {
  eyebrow_3: { nl: "Wijn uit de stad, voor de stad", en: "Wine from the city, for the city" },
  script_tagline: { nl: "de urban winery", en: "the urban winery" },
  intro_lead: {
    nl: "Druiven uit heel Europa, gekoeld naar een machinefabriek aan het IJ gebracht. Daar maken wij wijn: ",
    en: "Grapes from all over Europe, transported chilled to a machine factory on the IJ. That's where we make wine: ",
  },
  intro_em: { nl: "geen wijngaard, wel wijn.", en: "no vineyard, still wine." },
  cta_primary: { nl: "Boek een tasting", en: "Book a tasting" },
  cta_secondary: { nl: "Voor bedrijven", en: "For businesses" },
  media_caption: {
    nl: "↳ De makerij, Johan van Hasseltweg, Noord",
    en: "↳ The winery, Johan van Hasseltweg, Amsterdam-Noord",
  },
};

export type MarqueeContent = {
  marquee_1: ContentPair;
  marquee_2: ContentPair;
  marquee_3: ContentPair;
  marquee_4: ContentPair;
  marquee_5: ContentPair;
};

export const MARQUEE_DEFAULTS: MarqueeContent = {
  marquee_1: { nl: "Eerste urban winery van Nederland", en: "First urban winery in the Netherlands" },
  marquee_2: { nl: "De grootste van Europa", en: "The largest in Europe" },
  // Single-string item in the legacy array — identical in both languages today;
  // stored as a real bilingual pair so it becomes independently editable later.
  marquee_3: { nl: "Druiven uit FR · DE · IT · ES · NL", en: "Druiven uit FR · DE · IT · ES · NL" },
  marquee_4: { nl: "Tastings tussen de tanks", en: "Tastings among the tanks" },
  marquee_5: { nl: "Zero waste sinds dag één", en: "Zero waste since day one" },
};

export type ManifestContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2: ContentPair;
  body_lead: ContentPair;
  body_strong: ContentPair;
  body_tail: ContentPair;
  stat_1_value: ContentPair;
  stat_1_desc: ContentPair;
  stat_2_value: ContentPair;
  stat_2_desc: ContentPair;
  stat_3_value: ContentPair;
  stat_3_desc: ContentPair;
  stat_4_value: ContentPair;
  stat_4_desc: ContentPair;
};

export const MANIFEST_DEFAULTS: ManifestContent = {
  label: { nl: "Het verhaal", en: "Our story" },
  heading_line1: { nl: "Geen wijngaard.", en: "No vineyard." },
  heading_line2: { nl: "Wel wijn.", en: "Still wine." },
  body_lead: {
    nl: "Sinds 2017 reizen druiven van families en boeren uit heel Europa gekoeld naar Amsterdam-Noord. In een oude machinefabriek aan het IJ, tussen ",
    en: "Since 2017, grapes from families and farmers all over Europe travel chilled to Amsterdam-Noord. In an old machine factory on the IJ, between ",
  },
  body_strong: {
    nl: "stalen tanks, betonnen eieren, amforen en eikenhouten vaten",
    en: "steel tanks, concrete eggs, amphorae, and oak barrels",
  },
  body_tail: {
    nl: ", worden ze wijn. Omdat we de stad als wijngaard hebben, zijn we vrijer dan elke klassieke producent. Riesling die Moscatel ontmoet? Hier kan het.",
    en: ", they become wine. Because we have the city as our vineyard, we are freer than any classic producer. Riesling meeting Moscatel? Here it's possible.",
  },
  stat_1_value: { nl: "91", en: "91" },
  stat_1_desc: { nl: "Decanter-punten voor wijn uit Noord", en: "Decanter points for wine from North" },
  stat_2_value: { nl: "1500", en: "1500" },
  stat_2_desc: { nl: "Machinefabriek aan het IJ", en: "Machine factory on the IJ" },
  stat_3_value: { nl: "5", en: "5" },
  stat_3_desc: { nl: "Landen waar onze druiven groeien", en: "Countries where our grapes grow" },
  stat_4_value: { nl: "200000", en: "200000" },
  stat_4_desc: { nl: "Flessen per jaar, gemaakt in Noord", en: "Bottles per year, made in North" },
};

export type ProcessContent = {
  heading_lead: ContentPair;
  heading_em: ContentPair;
  sub_text: ContentPair;
  step_1_title: ContentPair;
  step_1_body: ContentPair;
  step_2_title: ContentPair;
  step_2_body: ContentPair;
  step_3_title: ContentPair;
  step_3_body: ContentPair;
  step_4_title: ContentPair;
  step_4_body: ContentPair;
};

export const PROCESS_DEFAULTS: ProcessContent = {
  heading_lead: { nl: "Van boer tot fles, ", en: "From farmer to bottle, " },
  heading_em: { nl: "dwars door de stad.", en: "straight through the city." },
  sub_text: {
    nl: "Wij verplaatsen de druif, niet de wijn. Daardoor zie je hier van dichtbij hoe wijn écht gemaakt wordt.",
    en: "We move the grape, not the wine. This lets you experience close-up how wine is truly made.",
  },
  step_1_title: { nl: "De druif", en: "The grape" },
  step_1_body: {
    nl: "Geselecteerde boeren en families in Frankrijk, Duitsland, Italië, Spanje en Nederland. Biologisch geteeld, op het juiste moment met de hand geplukt.",
    en: "Selected farmers and families in France, Germany, Italy, Spain, and the Netherlands. Organically grown, hand-picked at the perfect moment.",
  },
  step_2_title: { nl: "De reis", en: "The journey" },
  step_2_body: {
    nl: "Gekoeld transport naar Noord. Onderweg weken de schillen al. De eerste meters van de wijn worden op de snelweg gemaakt.",
    en: "Chilled transport to North. The skins are already macerating along the way. The wine's first meters are made on the highway.",
  },
  step_3_title: { nl: "De makerij", en: "The winery" },
  step_3_body: {
    nl: "Staal, beton, amfora of eik: er is weinig dat hier niet kan. Ons eigen lab waakt over elke liter, van most tot botteling.",
    en: "Steel, concrete, amphora, or oak: there is little that isn't possible here. Our own lab watches over every liter, from must to bottling.",
  },
  step_4_title: { nl: "De fles", en: "The bottle" },
  step_4_body: {
    nl: "Gebotteld aan het IJ. En zero waste: schillen en pitten worden bier, grappa en onze eigen Piquette d'Amsterdam.",
    en: "Bottled on the IJ. And zero waste: skins and seeds become beer, grappa, and our own Piquette d'Amsterdam.",
  },
};

export type PathsContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2_em: ContentPair;
  intro_body: ContentPair;
  path_1_title: ContentPair;
  path_1_body: ContentPair;
  path_2_title: ContentPair;
  path_2_body: ContentPair;
  path_3_title: ContentPair;
  path_3_body: ContentPair;
};

export const PATHS_DEFAULTS: PathsContent = {
  label: { nl: "Kies je glas", en: "Choose your glass" },
  heading_line1: { nl: "Voor proevers, schenkers", en: "For tasters, pourers" },
  heading_line2_em: { nl: "thuisdrinkers.", en: "home drinkers." },
  intro_body: {
    nl: "Toerist, inkoper of liefhebber: iedereen drinkt hier dezelfde wijn. Alleen de weg ernaartoe verschilt.",
    en: "Tourist, buyer, or wine lover: everyone here drinks the same wine. Only the path there differs.",
  },
  path_1_title: { nl: "Tours & tastings", en: "Tours & tastings" },
  path_1_body: {
    nl: "70 minuten tussen de tanks, zes wijnen op tafel, met verhaal en bites. Voor bezoekers van de stad, vriendengroepen en iedereen die wil weten hoe stadswijn smaakt.",
    en: "70 minutes between the tanks, six wines on the table, complete with stories and bites. For city visitors, groups of friends, and anyone who wants to know how urban wine tastes.",
  },
  path_2_title: { nl: "Voor bedrijven & horeca", en: "For businesses & hospitality" },
  path_2_body: {
    nl: "Grote afname, private label, relatiegeschenken en events in de winery. Eén aanspreekpunt, scherpe staffels, geproduceerd op 10 minuten van CS.",
    en: "Bulk orders, private label, corporate gifts, and events in the winery. A single point of contact, volume discounts, produced 10 minutes from Central Station.",
  },
  path_3_title: { nl: "De webshop", en: "The webshop" },
  path_3_body: {
    nl: "De volledige collectie, thuisbezorgd. Van klassieke monocépages tot blends die alleen in Noord kunnen bestaan.",
    en: "The complete collection, delivered to your door. From classic single-varietals to blends that could only exist in North.",
  },
};

export type WinesContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2_lead: ContentPair;
  heading_line2_em: ContentPair;
  cta_label: ContentPair;
};

export const WINES_DEFAULTS: WinesContent = {
  label: { nl: "De collectie", en: "The collection" },
  heading_line1: { nl: "Van klassiek", en: "From classic" },
  heading_line2_lead: { nl: "tot ", en: "to " },
  heading_line2_em: { nl: "eigenwijs.", en: "rebellious." },
  cta_label: { nl: "Shop alle wijnen", en: "Shop all wines" },
};

export type PlaceContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2: ContentPair;
  address_heading: ContentPair;
  address_line1: ContentPair;
  address_line2: ContentPair;
  hours_heading: ContentPair;
  hours_line1: ContentPair;
  hours_line2: ContentPair;
  route_line1: ContentPair;
  route_line2: ContentPair;
  cta_label: ContentPair;
};

export const PLACE_DEFAULTS: PlaceContent = {
  label: { nl: "De plek", en: "The venue" },
  heading_line1: { nl: "Een machinefabriek", en: "A machine factory" },
  heading_line2: { nl: "aan het IJ.", en: "on the IJ." },
  address_heading: { nl: "Adres", en: "Address" },
  address_line1: { nl: "Johan van Hasseltweg", en: "Johan van Hasseltweg" },
  address_line2: { nl: "Amsterdam-Noord", en: "Amsterdam-Noord" },
  hours_heading: { nl: "Open", en: "Hours" },
  hours_line1: { nl: "Wo t/m zo", en: "Wed thru Sun" },
  hours_line2: { nl: "12.00 tot 18.30", en: "12:00 to 18:30" },
  route_line1: { nl: "Pont vanaf CS, 10 min fietsen", en: "Ferry from Central Station, 10 min bike" },
  route_line2: { nl: "of metro 52 → Noorderpark", en: "or metro 52 → Noorderpark" },
  cta_label: { nl: "Plan je bezoek", en: "Plan your visit" },
};

export type WijnenPageContent = {
  label: ContentPair;
  heading_lead: ContentPair;
  heading_em: ContentPair;
  sub_text: ContentPair;
};

export const WIJNEN_PAGE_DEFAULTS: WijnenPageContent = {
  label: { nl: "De collectie", en: "The collection" },
  heading_lead: { nl: "Van klassiek", en: "From classic" },
  heading_em: { nl: "tot rebels", en: "to rebellious" },
  sub_text: {
    nl: "Wijnen, allemaal gevinifieerd middenin Amsterdam-Noord. Klik op een fles voor het volledige verhaal.",
    en: "Wines, all vinified in the heart of Amsterdam-Noord. Click a bottle for the full story.",
  },
};

export type ToursTastingsPageContent = {
  hero_label: ContentPair;
  hero_title_lead: ContentPair;
  hero_title_em: ContentPair;
  hero_sub: ContentPair;
  opening_line1: ContentPair;
  opening_line2: ContentPair;
  tour_heading: ContentPair;
  tour_body: ContentPair;
  tasting_heading: ContentPair;
  tasting_body: ContentPair;
  strip_duration: ContentPair;
  strip_duration_label: ContentPair;
  strip_wines: ContentPair;
  strip_wines_label: ContentPair;
  strip_discount: ContentPair;
  strip_discount_label: ContentPair;
  strip_price: ContentPair;
  strip_price_label: ContentPair;
  reserve_label: ContentPair;
  reserve_heading: ContentPair;
  reserve_sub: ContentPair;
};

export const TOURS_TASTINGS_PAGE_DEFAULTS: ToursTastingsPageContent = {
  hero_label: { nl: "Ontdek Chateau", en: "Discover Chateau" },
  hero_title_lead: { nl: "Tour &", en: "Tour &" },
  hero_title_em: { nl: "tasting", en: "tasting" },
  hero_sub: {
    nl: "70 minuten tussen de tanks. Zes wijnen op tafel. Een middag die je proeft in plaats van leest.",
    en: "70 minutes between the tanks. Six wines on the table. An afternoon you taste, not read.",
  },
  opening_line1: { nl: "Midden in de stad wordt hier wijn gemaakt, van tank tot glas.", en: "In the middle of the city, wine is made here, from tank to glass." },
  opening_line2: { nl: "Wij laten je proeven wat er ontstaat.", en: "We let you taste what it becomes." },
  tour_heading: { nl: "Tussen de tanks", en: "Between the tanks" },
  tour_body: {
    nl: "Een tour van 70 minuten door de winery. Je ziet hoe de druiven hier worden verwerkt tot wijn, van tank tot fles, en hoort het verhaal achter Chateau Amsterdam.",
    en: "A 70-minute tour through the winery. See how the grapes here become wine, from tank to bottle, and hear the story behind Chateau Amsterdam.",
  },
  tasting_heading: { nl: "Zes wijnen, één tafel", en: "Six wines, one table" },
  tasting_body: {
    nl: "Na de tour proef je 6 wijnen met een kleine snack erbij. Dieetwensen of allergieën? Laat het weten bij je aanvraag, dan houden we er rekening mee.",
    en: "After the tour you taste 6 wines with a small bite alongside. Dietary needs or allergies? Let us know in your request and we'll take care of it.",
  },
  strip_duration: { nl: "70 min", en: "70 min" },
  strip_duration_label: { nl: "Tour & tasting samen", en: "Tour & tasting together" },
  strip_wines: { nl: "6", en: "6" },
  strip_wines_label: { nl: "Wijnen om te proeven", en: "Wines to taste" },
  strip_discount: { nl: "20%", en: "20%" },
  strip_discount_label: { nl: "Korting in de winkel nadien", en: "Discount in the shop afterwards" },
  strip_price: { nl: "€55", en: "€55" },
  strip_price_label: { nl: "Per persoon", en: "Per person" },
  reserve_label: { nl: "Reserveren", en: "Reserve" },
  reserve_heading: { nl: "Boek je plek tussen de tanks.", en: "Book your spot between the tanks." },
  reserve_sub: { nl: "We bevestigen je aanvraag persoonlijk.", en: "We confirm your request personally." },
};

export type VoorBedrijvenPageContent = {
  intro_label: ContentPair;
  intro_heading_lead: ContentPair;
  intro_heading_em: ContentPair;
  intro_body: ContentPair;
  strip_contact_label: ContentPair;
  strip_distance: ContentPair;
  strip_distance_label: ContentPair;
  strip_produced_label: ContentPair;
  index_label: ContentPair;
  service_1_title: ContentPair;
  service_1_body: ContentPair;
  service_2_title: ContentPair;
  service_2_body: ContentPair;
  service_3_title: ContentPair;
  service_3_body: ContentPair;
  service_4_title: ContentPair;
  service_4_body: ContentPair;
  form_label: ContentPair;
  form_heading: ContentPair;
  form_intro: ContentPair;
  form_note: ContentPair;
};

export const VOOR_BEDRIJVEN_PAGE_DEFAULTS: VoorBedrijvenPageContent = {
  intro_label: { nl: "Zakelijk & horeca", en: "Business & hospitality" },
  intro_heading_lead: { nl: "Wijn die je bedrijf een", en: "Wine that gives your business a" },
  intro_heading_em: { nl: "verhaal geeft", en: "story" },
  intro_body: {
    nl: "Van de borrel tussen de tanks tot je naam op de fles. Eén partner, geproduceerd tien minuten van Amsterdam CS. Kies hieronder waar je aan denkt, wij nemen het van daar over.",
    en: "From drinks between the tanks to your name on the bottle. One partner, produced ten minutes from Amsterdam Central. Pick what you're thinking of below, we'll take it from there.",
  },
  strip_contact_label: { nl: "Aanspreekpunt, van begin tot levering", en: "One point of contact, from start to delivery" },
  strip_distance: { nl: "10 min", en: "10 min" },
  strip_distance_label: { nl: "Van Amsterdam CS, midden in Noord", en: "From Amsterdam Central, in the heart of Noord" },
  strip_produced_label: { nl: "Geproduceerd in de eigen winery", en: "Produced in our own winery" },
  index_label: { nl: "Vier manieren, één aanspreekpunt", en: "Four ways, one point of contact" },
  service_1_title: { nl: "Tastings & borrels", en: "Tastings & drinks" },
  service_1_body: {
    nl: "Zet je team tussen de tanks. Van 10 tot 60 personen, met of zonder bites erbij.",
    en: "Put your team between the tanks. From 10 to 60 guests, with or without bites.",
  },
  service_2_title: { nl: "Private label & relatiegeschenken", en: "Private label & corporate gifts" },
  service_2_body: {
    nl: "Jullie naam op de fles. Wij vinifiëren, jij bepaalt het etiket en het verhaal erachter.",
    en: "Your name on the bottle. We vinify, you decide the label and the story behind it.",
  },
  service_3_title: { nl: "Events & locatieverhuur", en: "Events & venue rental" },
  service_3_body: {
    nl: "De winery als decor. 20 tot 150 gasten, inclusief bar, geluid en sfeer.",
    en: "The winery as your backdrop. 20 to 150 guests, including bar, sound and atmosphere.",
  },
  service_4_title: { nl: "Groothandel voor horeca", en: "Wholesale for hospitality" },
  service_4_body: {
    nl: "Vaste plek op de kaart. Staffelkorting vanaf de eerste doos, altijd op voorraad.",
    en: "A permanent spot on the menu. Volume discount from the first case, always in stock.",
  },
  form_label: { nl: "Aanvraag", en: "Request" },
  form_heading: { nl: "Vertel ons waar je aan denkt.", en: "Tell us what you have in mind." },
  form_intro: { nl: "Eén formulier, rechtstreeks bij het team.", en: "One form, straight to the team." },
  form_note: { nl: "We reageren binnen 1 werkdag.", en: "We respond within 1 business day." },
};

export type FooterContent = {
  footer_note: ContentPair;
  discover_heading: ContentPair;
  discover_link_1: ContentPair;
  discover_link_2: ContentPair;
  discover_link_3: ContentPair;
  do_heading: ContentPair;
  do_link_2: ContentPair;
};

export const FOOTER_DEFAULTS: FooterContent = {
  footer_note: {
    nl: "Urban winery aan het IJ. Druiven uit heel Europa, wijn uit Noord, sinds 2017.",
    en: "Urban winery on the IJ. Grapes from all over Europe, wine from Amsterdam-Noord, since 2017.",
  },
  discover_heading: { nl: "Ontdek", en: "Discover" },
  discover_link_1: { nl: "Het verhaal", en: "Our story" },
  discover_link_2: { nl: "Het proces", en: "The process" },
  discover_link_3: { nl: "De collectie", en: "The collection" },
  do_heading: { nl: "Doen", en: "Do" },
  do_link_2: { nl: "Voor bedrijven", en: "For businesses" },
};
