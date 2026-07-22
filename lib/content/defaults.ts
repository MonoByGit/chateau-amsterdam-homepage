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
