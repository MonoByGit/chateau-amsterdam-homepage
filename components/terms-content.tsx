// components/terms-content.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";

export function TermsContent() {
  const { lang } = useLanguage();

  if (lang === "en") {
    return (
      <div className="legal-page">
        <h1>Terms &amp; conditions</h1>
        <span className="legal-updated">Last updated: July 2026</span>

        <section>
          <h2>Who these terms apply to</h2>
          <p>
            These terms apply to your use of chateau.amsterdam, run by Chateau Amsterdam, Johan van Hasseltweg,
            Amsterdam-Noord. By using this site, requesting a tour or tasting, sending a business enquiry, or buying
            wine through our shop, you accept these terms.
          </p>
        </section>

        <section>
          <h2>Tours &amp; tastings</h2>
          <p>
            A tour or tasting request submitted through this site is an enquiry, not a confirmed booking. We confirm
            availability, date, and final price by email or phone after you submit the form. Cancellation and
            rescheduling terms are agreed at that point.
          </p>
        </section>

        <section>
          <h2>Business enquiries</h2>
          <p>
            A business enquiry submitted through this site is a request for a quote, not a binding agreement. Our
            team follows up to discuss your occasion, group size, and pricing before anything is confirmed.
          </p>
        </section>

        <section>
          <h2>Buying wine</h2>
          <p>
            Wine is sold through our Shopify-powered shop, not directly on this site. When you add a bottle to your
            cart here, the order, payment, and checkout are completed on Shopify&apos;s platform, which has its own
            terms covering price, delivery, returns, and payment. This site only presents the product and hands the
            cart over to checkout.
          </p>
        </section>

        <section>
          <h2>Age requirement</h2>
          <p>
            Our wine is intended for visitors aged 18 and over. By confirming the age check on this site, you
            declare that you meet this requirement. We reserve the right to verify age again at the point of
            delivery or on-site, as required by Dutch law.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            We take reasonable care to keep this site accurate and available, but we do not guarantee it is free of
            errors or interruptions. We are not liable for damages arising from use of this site beyond what Dutch
            law requires.
          </p>
        </section>

        <section>
          <h2>Applicable law</h2>
          <p>
            These terms are governed by Dutch law. Disputes are submitted to the competent court in the district
            where Chateau Amsterdam is established, unless the law requires otherwise.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms? Reach us at <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>.
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
      <h1>Algemene voorwaarden</h1>
      <span className="legal-updated">Laatst bijgewerkt: juli 2026</span>

      <section>
        <h2>Voor wie deze voorwaarden gelden</h2>
        <p>
          Deze voorwaarden gelden voor het gebruik van chateau.amsterdam, beheerd door Chateau Amsterdam, Johan van
          Hasseltweg, Amsterdam-Noord. Door deze site te gebruiken, een tour of tasting aan te vragen, een zakelijke
          aanvraag te sturen, of wijn te kopen via onze shop, ga je akkoord met deze voorwaarden.
        </p>
      </section>

      <section>
        <h2>Tours &amp; tastings</h2>
        <p>
          Een tour- of tasting-aanvraag via deze site is een aanvraag, geen bevestigde boeking. We bevestigen
          beschikbaarheid, datum en definitieve prijs per e-mail of telefoon nadat je het formulier hebt verstuurd.
          Annulerings- en verzettermijnen spreken we op dat moment af.
        </p>
      </section>

      <section>
        <h2>Zakelijke aanvragen</h2>
        <p>
          Een zakelijke aanvraag via deze site is een verzoek om een offerte, geen bindende overeenkomst. Ons team
          neemt contact op om gelegenheid, groepsgrootte en prijs te bespreken voordat iets wordt bevestigd.
        </p>
      </section>

      <section>
        <h2>Wijn kopen</h2>
        <p>
          Wijn wordt verkocht via onze Shopify-gedreven shop, niet rechtstreeks op deze site. Wanneer je hier een
          fles toevoegt aan je winkelmandje, worden bestelling, betaling en afrekenen afgerond op het platform van
          Shopify, dat eigen voorwaarden hanteert voor prijs, levering, retour en betaling. Deze site toont alleen het
          product en draagt het winkelmandje over aan checkout.
        </p>
      </section>

      <section>
        <h2>Leeftijdseis</h2>
        <p>
          Onze wijn is bedoeld voor bezoekers van 18 jaar en ouder. Door de leeftijdscheck op deze site te bevestigen,
          verklaar je dat je aan deze eis voldoet. We behouden ons het recht voor om leeftijd opnieuw te controleren
          bij levering of ter plekke, zoals de Nederlandse wet vereist.
        </p>
      </section>

      <section>
        <h2>Aansprakelijkheid</h2>
        <p>
          We doen redelijke moeite om deze site accuraat en beschikbaar te houden, maar garanderen niet dat ze vrij is
          van fouten of onderbrekingen. We zijn niet aansprakelijk voor schade die voortkomt uit het gebruik van deze
          site, verder dan wat de Nederlandse wet vereist.
        </p>
      </section>

      <section>
        <h2>Toepasselijk recht</h2>
        <p>
          Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde
          rechter in het arrondissement waar Chateau Amsterdam is gevestigd, tenzij de wet anders bepaalt.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Vragen over deze voorwaarden? Neem contact op via{" "}
          <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>.
        </p>
      </section>

      <p style={{ marginTop: 40 }}>
        <Link href="/">← Terug naar home</Link>
      </p>
    </div>
  );
}
