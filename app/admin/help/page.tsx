// app/admin/help/page.tsx
export const dynamic = "force-dynamic";

export default function HelpPage() {
  return (
    <div style={{ maxWidth: "62rem" }}>
      <h1 className="a-h1">Handleiding &amp; Systeembeheer</h1>
      <p className="a-subtitle">
        Actuele werkwijze voor het beheer van Chateau Amsterdam: van binnenkomende aanvragen en omboeken tot de E-mail Studio en Google Agenda koppeling.
      </p>

      {/* Live Status & Oplevering Card */}
      <div
        className="a-card"
        style={{
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          background: "rgba(184, 134, 11, 0.08)",
          border: "1px solid rgba(184, 134, 11, 0.35)",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>🚀</span>
          <h2 className="a-h2" style={{ fontSize: "1.125rem", margin: 0, color: "var(--a-text)" }}>
            Actuele Systeemstatus (Productie-Klaar)
          </h2>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--a-text-2)", margin: "0 0 1rem 0" }}>
          Alle functionaliteiten zijn volledig gebouwd, getest en klaargezet voor het team:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
          <div style={{ padding: "0.75rem", background: "var(--a-card-bg)", borderRadius: "6px", border: "1px solid var(--a-border)" }}>
            <strong style={{ color: "#22c55e", fontSize: "0.875rem" }}>✓ Reserveringen &amp; Omboeken</strong>
            <p style={{ fontSize: "0.75rem", color: "var(--a-text-2)", margin: "0.25rem 0 0 0" }}>
              1-klik goedkeuring via e-mail of telefonisch omboeken via CMS.
            </p>
          </div>

          <div style={{ padding: "0.75rem", background: "var(--a-card-bg)", borderRadius: "6px", border: "1px solid var(--a-border)" }}>
            <strong style={{ color: "#22c55e", fontSize: "0.875rem" }}>✓ E-mail Studio</strong>
            <p style={{ fontSize: "0.75rem", color: "var(--a-text-2)", margin: "0.25rem 0 0 0" }}>
              Editor in NL/EN, live desktop &amp; mobiel previews, HTML export.
            </p>
          </div>

          <div style={{ padding: "0.75rem", background: "var(--a-card-bg)", borderRadius: "6px", border: "1px solid var(--a-border)" }}>
            <strong style={{ color: "#22c55e", fontSize: "0.875rem" }}>✓ Shopify Realtime Sync</strong>
            <p style={{ fontSize: "0.75rem", color: "var(--a-text-2)", margin: "0.25rem 0 0 0" }}>
              Wijnen, prijzen, pairings, smaakprofielen en checkout hand-off.
            </p>
          </div>

          <div style={{ padding: "0.75rem", background: "var(--a-card-bg)", borderRadius: "6px", border: "1px solid var(--a-border)" }}>
            <strong style={{ color: "#22c55e", fontSize: "0.875rem" }}>✓ Google Agenda Koppeling</strong>
            <p style={{ fontSize: "0.75rem", color: "var(--a-text-2)", margin: "0.25rem 0 0 0" }}>
              iCal synchronisatie voor automatische tijdslot-blokkades.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Overzicht van modules */}
      <div className="a-dashboard-section">
        <h2>Overzicht van het CMS</h2>
        <div className="a-help-grid">
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Reserveringen</span>
            <h3>Aanvragen &amp; Omboeken</h3>
            <p>Binnenkomende tastings en zakelijke aanvragen direct bevestigen of na telefonisch overleg omzetten naar een nieuw moment.</p>
          </div>

          <div className="a-card a-help-card">
            <span className="a-eyebrow">E-mail Studio</span>
            <h3>Templates &amp; Teksten</h3>
            <p>Pas alle automatische e-mails aan in NL &amp; EN, bekijk live desktop/mobiele previews en exporteer HTML.</p>
          </div>

          <div className="a-card a-help-card">
            <span className="a-eyebrow">Beschikbaarheid</span>
            <h3>Kalender &amp; Google Agenda</h3>
            <p>Tijdsloten of hele dagen sluiten in het CMS of automatisch via de Google Workspace Calendar sync.</p>
          </div>

          <div className="a-card a-help-card">
            <span className="a-eyebrow">Wijnen</span>
            <h3>Shopify Synchronisatie</h3>
            <p>Wijnen, foto&apos;s, alcoholpercentage, smaakprofielen, pairings en one-liners komen realtime uit Shopify.</p>
          </div>

          <div className="a-card a-help-card">
            <span className="a-eyebrow">Content &amp; Foto&apos;s</span>
            <h3>Website Teksten</h3>
            <p>Pas alle koppen, intro&apos;s, verhalen en sfeerfoto&apos;s op de homepage, zakelijke en tasting-pagina&apos;s aan.</p>
          </div>

          <div className="a-card a-help-card">
            <span className="a-eyebrow">Team</span>
            <h3>Accounts &amp; Beveiliging</h3>
            <p>Eigen wachtwoord wijzigen en collega&apos;s toevoegen of beheren.</p>
          </div>
        </div>
      </div>

      {/* Stap-voor-stap werkwijzen */}
      <div className="a-dashboard-section">
        <h2>Instructies per Onderdeel</h2>
        <div className="a-card">

          {/* 1. Reserveringen Flow */}
          <details className="a-help-howto" open>
            <summary>🍷 1. Hoe handel je een reserveringsaanvraag af?</summary>
            <div className="a-help-howto-body">
              <p>
                Wanneer een bezoeker via de website een proeverij of zakelijke aanvraag indient, ziet de bezoeker direct een bevestiging op het scherm en ontvangt <strong>Sales</strong> een e-mailnotificatie met twee directe knoppen:
              </p>

              <h4>Scenario A: Het aangevraagde tijdslot past wél</h4>
              <ol>
                <li>Klik in de binnengekomen e-mail (of in het CMS) direct op <strong>`✓ Bevestigen`</strong>.</li>
                <li>De reservering wordt automatisch op <em>Bevestigd</em> gezet en in de agenda geplaatst.</li>
                <li>De klant ontvangt direct de officiële <strong>Definitieve Bevestigingsmail</strong> met alle details, datum, tijd en adres.</li>
              </ol>

              <h4>Scenario B: Het aangevraagde tijdslot kan NIET (Omboeken)</h4>
              <ol>
                <li>Klik in de e-mail op <strong>`✏️ Wijzigen`</strong> (of open de reservering in het CMS).</li>
                <li>Klik op de knop <strong>`📞 Bel klant`</strong> om direct telefonisch een alternatief moment af te stemmen.</li>
                <li>Vul in het formulier de nieuw overeengekomen datum en het nieuwe tijdslot in.</li>
                <li>Klik op <strong>`✅ Opslaan &amp; Definitieve Bevestiging naar klant sturen`</strong>.</li>
                <li>Het systeem past de reservering aan en de klant ontvangt direct de bevestigingsmail met de nieuwe datum en tijd!</li>
              </ol>
            </div>
          </details>

          {/* 2. E-mail Studio */}
          <details className="a-help-howto" open>
            <summary>📬 2. E-mails beheren &amp; aanpassen in de E-mail Studio</summary>
            <div className="a-help-howto-body">
              <p>
                Onder <strong>E-mailtemplates</strong> in het linkermenu vind je de E-mail Studio. Hier beheer je de teksten van alle 4 actieve e-mailtemplates:
              </p>
              <ul>
                <li><strong>1. Klant: Definitieve Bevestiging:</strong> De officiële bevestiging die de klant ontvangt na goedkeuring of omboeking.</li>
                <li><strong>2. Klant: Wijziging Reservering:</strong> Wordt verstuurd als Sales achteraf een bestaande boeking wijzigt.</li>
                <li><strong>3. Sales: Tasting Aanvraag:</strong> Notificatiemail met actieknoppen voor particuliere tours.</li>
                <li><strong>4. Sales: Zakelijke Aanvraag:</strong> Notificatiemail voor zakelijke events, groothandel en private label.</li>
              </ul>

              <h4>Hoe pas je teksten aan?</h4>
              <ol>
                <li>Kies het gewenste template via de tabbladen bovenaan.</li>
                <li>Schakel tussen <strong>🇳🇱 Nederlands</strong> en <strong>🇬🇧 English</strong>.</li>
                <li>Pas de onderwerpregel, koptekst, introductie of afsluitende tekst aan in het linkerpaneel.</li>
                <li>Klik op <strong>💾 Wijzigingen opslaan</strong>. De wijziging is direct actief voor alle uitgaande e-mails.</li>
                <li>Bekijk rechts realtime het resultaat in <strong>Desktop weergave</strong> of <strong>Mobiel (390px iPhone)</strong>.</li>
                <li>Wil je het template gebruiken in een extern systeem (zoals Mailchimp of Klaviyo)? Klik rechtsboven op <strong>📋 HTML Kopiëren</strong> of <strong>📥 Download</strong>.</li>
              </ol>
            </div>
          </details>

          {/* 3. Google Workspace Calendar Sync */}
          <details className="a-help-howto">
            <summary>📅 3. Google Workspace Agenda &amp; Beschikbaarheid</summary>
            <div className="a-help-howto-body">
              <p>
                Onder <strong>Beschikbaarheid</strong> zie je de kalender. Je kunt hier handmatig data en tijdsloten (12:00, 14:00, 16:00, 18:00) blokkeren, óf dit automatisch laten synchroniseren met jullie Google Workspace Agenda.
              </p>

              <h4>Eenmalige koppeling met Google Calendar:</h4>
              <ol>
                <li>Open Google Calendar in je browser (met het Chateau Workspace account).</li>
                <li>Klik naast de gewenste agenda (bijv. <em>Tastings &amp; Events</em>) op de 3 puntjes → <strong>Instellingen en delen</strong>.</li>
                <li>Scroll naar beneden naar <strong>Agenda integreren</strong>.</li>
                <li>Kopieer het <strong>&ldquo;Geheim adres in iCal-indeling&rdquo;</strong> (de URL die eindigt op <code>.ics</code>).</li>
                <li>Plak deze URL in het CMS onder <strong>Beschikbaarheid</strong> → <strong>Google Workspace Calendar Koppeling</strong> en klik op <strong>URL Opslaan</strong>.</li>
              </ol>

              <h4>Hoe herkent het systeem gebeurtenissen in Google Calendar?</h4>
              <ul>
                <li><strong>Hele dag sluiten:</strong> Maak een dagafspraak in Google Calendar met de titel <em>&ldquo;Gesloten&rdquo;</em>, <em>&ldquo;Dicht&rdquo;</em> of <em>&ldquo;Volgeboekt&rdquo;</em>. Die dag kan niet meer geboekt worden op de site.</li>
                <li><strong>Tijdslot blokkeren:</strong> Maak een afspraak op het tijdstip (bijv. om 14:00 of 16:00 uur) met een titel zoals <em>&ldquo;Besloten groep&rdquo;</em>. Uitsluitend dat tijdslot verdwijnt van de website.</li>
              </ul>
            </div>
          </details>

          {/* 4. Wijnen via Shopify */}
          <details className="a-help-howto">
            <summary>🍇 4. Wijnen, prijzen &amp; data beheren via Shopify</summary>
            <div className="a-help-howto-body">
              <p>
                De wijnpagina&apos;s halen alle data rechtstreeks realtime uit <strong>Shopify</strong>. Je hoeft een wijn nooit op twee plekken in te voeren:
              </p>
              <ul>
                <li><strong>Foto:</strong> Wordt automatisch opgehaald uit het eerste mediabestand in Shopify.</li>
                <li><strong>Wijn &amp; Spijs (Pairing):</strong> Vul in Shopify het metaveld <code>pairing</code> in.</li>
                <li><strong>One-liner:</strong> Wordt opgehaald uit de korte samenvatting in Shopify.</li>
                <li><strong>Wijnprofiel / Verhaal:</strong> Wordt opgehaald uit het veld <code>wine profile</code>.</li>
                <li><strong>Druif, Regio &amp; Alcoholpercentage:</strong> Worden overgenomen uit de specificaties en tags in Shopify.</li>
                <li><strong>Homepage uitlichten:</strong> Voeg de wijn in Shopify toe aan de collectie <em>&ldquo;Homepage&rdquo;</em> (maximaal 5 wijnen).</li>
              </ul>
            </div>
          </details>

          {/* 5. Team Accounts */}
          <details className="a-help-howto">
            <summary>👥 5. Teamleden toevoegen of wachtwoord wijzigen</summary>
            <div className="a-help-howto-body">
              <ol>
                <li>Ga in het linkermenu naar <strong>Account</strong>.</li>
                <li>Onder <em>Wachtwoord wijzigen</em> pas je je eigen wachtwoord aan.</li>
                <li>Onder <em>Nieuw account toevoegen</em> vul je het e-mailadres van een collega in om hen toegang te geven.</li>
              </ol>
            </div>
          </details>

        </div>
      </div>
    </div>
  );
}
