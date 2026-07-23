// app/admin/help/page.tsx
export default function HelpPage() {
  return (
    <div>
      <h1 className="a-h1">Handleiding</h1>
      <p className="a-subtitle">Wat er allemaal in het CMS zit, en hoe je de belangrijkste dingen zelf doet.</p>

      <div className="a-dashboard-section">
        <h2>Overzicht</h2>
        <div className="a-help-grid">
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Overzicht</span>
            <h3>Startpagina</h3>
            <p>Openstaande reserveringen, binnenkort geblokkeerde dagen, en bezoekersstatistieken in één oogopslag.</p>
          </div>
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Reserveringen</span>
            <h3>Aanvragen afhandelen</h3>
            <p>Elke tasting- of tour-aanvraag komt hier binnen. Bevestigen, afwijzen, of in behandeling zetten.</p>
          </div>
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Beschikbaarheid</span>
            <h3>Kalender & iCal Sync</h3>
            <p>Vaste tijdslots (15:00, 17:00, 19:00) of hele dagen blokkeren. Automatisch gekoppeld aan Google Workspace Calendar.</p>
          </div>
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Content</span>
            <h3>Teksten op de site</h3>
            <p>Koppen, intro&apos;s en labels per sectie van de homepage, zonder dat er iets herbouwd hoeft te worden.</p>
          </div>
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Media</span>
            <h3>Foto-bibliotheek</h3>
            <p>Alle geüploade foto&apos;s op één plek, te gebruiken bij teksten en content elders in het CMS.</p>
          </div>
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Account</span>
            <h3>Jij en je team</h3>
            <p>Eigen wachtwoord wijzigen, en collega&apos;s toevoegen of verwijderen die ook mogen inloggen.</p>
          </div>
        </div>
      </div>

      <div className="a-dashboard-section">
        <h2>Hoe het werkt</h2>
        <div className="a-card">
          <details className="a-help-howto">
            <summary>Een reservering afhandelen</summary>
            <div className="a-help-howto-body">
              <ol>
                <li>Ga naar <strong>Reserveringen</strong>. Nieuwe aanvragen staan bovenaan.</li>
                <li>Open de aanvraag voor naam, gastenaantal, datum en eventuele opmerkingen.</li>
                <li>
                  Zet de status op <strong>Bevestigd</strong> of <strong>Afgewezen</strong>. De klant ziet dit niet
                  automatisch terug, bevestig het gesprek zelf per mail of telefoon.
                </li>
              </ol>
            </div>
          </details>
          <details className="a-help-howto">
            <summary>Een dag of tijdslot (deels) blokkeren via het CMS</summary>
            <div className="a-help-howto-body">
              <ol>
                <li>Ga naar <strong>Beschikbaarheid</strong> en klik op de gewenste datum in de kalender.</li>
                <li>
                  Vink <strong>Deze hele dag niet beschikbaar (volledig gesloten)</strong> aan voor een vakantiedag of feestdag.
                </li>
                <li>
                  Of vink een specifiek tijdslot aan (bijv. <strong>15:00 uur</strong>, <strong>17:00 uur</strong> of <strong>19:00 uur</strong>) om uitsluitend dat moment te blokkeren voor boekingen.
                </li>
                <li>Klik op <strong>Opslaan</strong>. Geblokkeerde dagen/slots worden direct op de reserveringspagina uitgeschakeld.</li>
              </ol>
            </div>
          </details>

          <details className="a-help-howto" open>
            <summary>📅 Google Workspace Calendar koppelen & gebruiken (iCal Sync)</summary>
            <div className="a-help-howto-body">
              <p>
                Je kunt de beschikbaarheid op de website automatisch laten synchroniseren met de Google Calendar van Chateau Amsterdam. Zodra er afspraken of sluitingen in Google Agenda staan, blokkeert de site die momenten vanzelf.
              </p>
              
              <h4>1. Eenmalige Initiële Set-up:</h4>
              <ol>
                <li>Open <strong>Google Calendar</strong> in de browser (ingelogd met het Chateau Google Workspace account).</li>
                <li>Zoek aan de linkerkant de agenda op (bijv. <em>&ldquo;Chateau Tastings & Events&rdquo;</em>) en klik op de 3 puntjes → <strong>Instellingen en delen</strong>.</li>
                <li>Scroll in het linkermenu naar het kopje <strong>Agenda integreren</strong>.</li>
                <li>Zoek de regel <strong>&ldquo;Geheim adres in iCal-indeling&rdquo;</strong> en kopieer de geheime URL (deze eindigt op <code>.ics</code>).</li>
                <li>Ga in dit CMS naar <strong>Beschikbaarheid</strong>, plak de gekopieerde URL in het vak onder <em>Google Workspace Calendar Koppeling</em> en klik op <strong>URL Opslaan</strong>.</li>
                <li>Klik daarna op de knop <strong>🔄 Nu Synchroniseren</strong> om de eerste sync uit te voeren.</li>
              </ol>

              <h4>2. Dagelijks gebruik via Google Calendar:</h4>
              <ul>
                <li>
                  <strong>Hele dag sluiten:</strong> Maak een dag-evenement aan in Google Calendar met de titel <em>&ldquo;Dicht&rdquo;</em>, <em>&ldquo;Gesloten&rdquo;</em> of <em>&ldquo;Volgeboekt&rdquo;</em>. De site sluit die dag automatisch volledig voor reserveringen.
                </li>
                <li>
                  <strong>Specifiek tijdslot blokkeren:</strong> Maak een afspraak aan op het desbetreffende tijdstip (bijv. om 15:00, 17:00 of 19:00 uur) met een titel zoals <em>&ldquo;Besloten feest&rdquo;</em> of <em>&ldquo;Groepsboeking&rdquo;</em>. De site schakelt uitsluitend dat tijdslot uit voor bezoekers.
                </li>
                <li>
                  <strong>Handmatige verversing:</strong> Heb je zojuist iets aangepast in Google Calendar en wil je dat het nú op de site staat? Ga in het CMS naar <strong>Beschikbaarheid</strong> en klik op <strong>🔄 Nu Synchroniseren</strong>.
                </li>
              </ul>
            </div>
          </details>
          <details className="a-help-howto">
            <summary>Een wijn toevoegen, verbergen of op de homepage zetten</summary>
            <div className="a-help-howto-body">
              <p>
                De wijnenpagina en de wijndetailpagina&apos;s zijn een spiegel van Shopify: alles wat je in Shopify
                aanpast (foto, prijs, voorraad, tekstvelden onder &ldquo;Productmetavelden&rdquo;) verschijnt
                automatisch op de site, meestal binnen 5 minuten. Er is nergens meer een aparte plek waar je een wijn
                nogmaals moet invoeren.
              </p>
              <p>
                <strong>Nieuwe wijn toevoegen:</strong> maak 'm aan als product in Shopify (Producten → Product
                toevoegen), met Categorie &ldquo;Wijn&rdquo; en het juiste Type (Rood/Wit/Oranje/Rosé/Pét-Nat/Piquette).
                Zodra het Type klopt en de status op &ldquo;Actief&rdquo; staat, verschijnt de wijn vanzelf op de
                wijnenpagina, zonder dat je 'm ergens handmatig hoeft toe te voegen.
              </p>
              <p>
                <strong>Wijn (tijdelijk) van de site halen:</strong> zet de status in Shopify op &ldquo;Concept&rdquo;
                of &ldquo;Gearchiveerd&rdquo;. Wil je 'm laten staan als verkoopbaar product maar wel van de
                wijnenpagina weren, klik dan in de collectie <strong>All our wines</strong> op &ldquo;Uitsluiten&rdquo;
                voor die specifieke wijn.
              </p>
              <p>
                <strong>Op de homepage uitlichten:</strong> voeg de wijn toe aan de collectie{" "}
                <strong>Homepage</strong> in Shopify (Producten → Collecties). Maximaal 5 tegelijk, sleep daar de
                volgorde.
              </p>
              <p>
                Tekstvelden zoals het verhaal, wijn-spijs advies, druif en streek staan onder &ldquo;Productmetavelden&rdquo;
                op de productpagina in Shopify — niet verplicht om te vullen, maar zorgen wel voor een rijkere
                detailpagina.
              </p>
            </div>
          </details>
          <details className="a-help-howto">
            <summary>Een collega toevoegen (of verwijderen)</summary>
            <div className="a-help-howto-body">
              <ol>
                <li>Ga naar <strong>Account</strong>, onderaan staat &ldquo;Nieuw account toevoegen&rdquo;.</li>
                <li>
                  Vul het e-mailadres in. Je krijgt eenmalig een tijdelijk wachtwoord te zien, geef dit door, het
                  wordt daarna niet meer getoond.
                </li>
                <li>De collega logt in en wijzigt het wachtwoord meteen naar iets eigens, onder <strong>Account</strong>.</li>
              </ol>
              <p>
                Verwijderen kan ook vanuit hetzelfde scherm. Je eigen account en het laatste overgebleven account
                kunnen niet verwijderd worden, zodat niemand zichzelf per ongeluk buitensluit.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
