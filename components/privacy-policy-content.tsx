// components/privacy-policy-content.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";

export function PrivacyPolicyContent() {
  const { lang } = useLanguage();

  if (lang === "en") {
    return (
      <div className="legal-page">
        <h1>Privacy policy</h1>
        <span className="legal-updated">Last updated: July 2026</span>

        <section>
          <h2>Who we are</h2>
          <p>
            Chateau Amsterdam is an urban winery on Johan van Hasseltweg in Amsterdam-Noord. This policy explains
            what personal data we collect through chateau.amsterdam, why, and what rights you have.
          </p>
        </section>

        <section>
          <h2>What we collect, and why</h2>
          <p>We only collect what a specific part of the site actually needs:</p>
          <ul>
            <li>
              <strong>Tour &amp; tasting bookings:</strong> name, email, phone number, group size and any notes you
              add, so we can confirm and organise your visit.
            </li>
            <li>
              <strong>Business enquiries:</strong> name, company name, email, phone number, occasion, group size and
              notes, so our team can respond to your request.
            </li>
            <li>
              <strong>Shopping cart:</strong> a technical cart-ID cookie from our Shopify checkout, needed to keep
              your cart working while you browse. It does not contain personal data by itself.
            </li>
            <li>
              <strong>Language preference:</strong> stored only in your own browser (localStorage), never sent to
              us.
            </li>
            <li>
              <strong>Analytics:</strong> we use Umami, a self-hosted, cookieless analytics tool, and only load it
              after you accept it in the cookie banner. It does not track you individually across sites.
            </li>
          </ul>
        </section>

        <section>
          <h2>Legal basis</h2>
          <p>
            We process booking and enquiry data based on our legitimate interest in responding to your request, and
            to perform the reservation you asked for. Analytics only runs with your consent, given via the cookie
            banner, which you can withdraw at any time by clearing your browser&apos;s local storage for this site.
          </p>
        </section>

        <section>
          <h2>How long we keep it</h2>
          <p>
            We keep booking and enquiry data no longer than necessary to handle your request, and in any case no
            longer than legally required (for example, invoices fall under the Dutch 7-year fiscal retention
            requirement).
          </p>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <p>
            We share cart and checkout data with Shopify, our e-commerce platform, only to the extent needed to
            process an order. We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Under the GDPR you can ask to see, correct, or delete the personal data we hold about you, or object to
            how we use it. Contact us at{" "}
            <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>. You can also file a complaint with
            the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use one essential cookie for the shopping cart, and, only with your consent, cookieless analytics via
            Umami. See our cookie banner to change your choice at any time.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date above shows when it was last changed. Questions?
            Reach us at <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>.
          </p>
        </section>

        <p style={{ marginTop: 40 }}>
          <Link href="/">← Back to home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="legal-page">
      <h1>Privacybeleid</h1>
      <span className="legal-updated">Laatst bijgewerkt: juli 2026</span>

      <section>
        <h2>Wie we zijn</h2>
        <p>
          Chateau Amsterdam is een urban winery aan de Johan van Hasseltweg in Amsterdam-Noord. Dit beleid legt uit
          welke persoonsgegevens we verzamelen via chateau.amsterdam, waarom, en welke rechten je hebt.
        </p>
      </section>

      <section>
        <h2>Welke gegevens we verzamelen, en waarom</h2>
        <p>We verzamelen alleen wat een specifiek onderdeel van de site daadwerkelijk nodig heeft:</p>
        <ul>
          <li>
            <strong>Tour &amp; tasting reserveringen:</strong> naam, e-mailadres, telefoonnummer, groepsgrootte en
            eventuele opmerkingen, zodat we je bezoek kunnen bevestigen en organiseren.
          </li>
          <li>
            <strong>Zakelijke aanvragen:</strong> naam, bedrijfsnaam, e-mailadres, telefoonnummer, gelegenheid,
            groepsgrootte en opmerkingen, zodat ons team op je aanvraag kan reageren.
          </li>
          <li>
            <strong>Winkelmandje:</strong> een technische winkelmandje-ID-cookie van onze Shopify-koppeling, nodig om
            je winkelmandje te laten werken tijdens het browsen. Bevat op zichzelf geen persoonsgegevens.
          </li>
          <li>
            <strong>Taalvoorkeur:</strong> wordt alleen lokaal in je eigen browser opgeslagen (localStorage), nooit
            naar ons verzonden.
          </li>
          <li>
            <strong>Analytics:</strong> we gebruiken Umami, een self-hosted, cookieless analytics-tool, en laden dit
            pas nadat je akkoord gaat via de cookiebanner. Dit volgt je niet individueel over andere sites.
          </li>
        </ul>
      </section>

      <section>
        <h2>Grondslag</h2>
        <p>
          We verwerken reserverings- en aanvraaggegevens op basis van ons gerechtvaardigd belang om op je aanvraag te
          reageren en de reservering uit te voeren die je hebt gevraagd. Analytics draait alleen met jouw toestemming
          via de cookiebanner, die je op elk moment kunt intrekken door de lokale opslag van je browser voor deze
          site te wissen.
        </p>
      </section>

      <section>
        <h2>Hoe lang we het bewaren</h2>
        <p>
          We bewaren reserverings- en aanvraaggegevens niet langer dan nodig om je aanvraag af te handelen, en in elk
          geval niet langer dan wettelijk verplicht (facturen vallen bijvoorbeeld onder de fiscale bewaarplicht van 7
          jaar).
        </p>
      </section>

      <section>
        <h2>Met wie we het delen</h2>
        <p>
          We delen winkelmandje- en afrekengegevens met Shopify, ons e-commerceplatform, alleen voor zover nodig om
          een bestelling te verwerken. We verkopen jouw persoonsgegevens niet aan derden.
        </p>
      </section>

      <section>
        <h2>Jouw rechten</h2>
        <p>
          Onder de AVG kun je vragen om inzage, correctie of verwijdering van de persoonsgegevens die we van je
          hebben, of bezwaar maken tegen hoe we ze gebruiken. Neem contact op via{" "}
          <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>. Je kunt ook een klacht indienen bij de
          Autoriteit Persoonsgegevens.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We gebruiken één noodzakelijke cookie voor het winkelmandje, en, alleen met jouw toestemming, cookieless
          analytics via Umami. Via onze cookiebanner kun je je keuze op elk moment aanpassen.
        </p>
      </section>

      <section>
        <h2>Wijzigingen in dit beleid</h2>
        <p>
          We kunnen dit beleid van tijd tot tijd bijwerken. De datum hierboven laat zien wanneer het voor het laatst
          is gewijzigd. Vragen? Neem contact op via{" "}
          <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>.
        </p>
      </section>

      <p style={{ marginTop: 40 }}>
        <Link href="/">← Terug naar home</Link>
      </p>
    </div>
  );
}
