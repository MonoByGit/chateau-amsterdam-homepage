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
            <h3>Kalender</h3>
            <p>Per dag tot 4 vrije tijdslots instellen, of de hele dag op niet-beschikbaar zetten. Voor vakanties, feestdagen, privé-events.</p>
          </div>
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Content</span>
            <h3>Teksten op de site</h3>
            <p>Koppen, intro&apos;s en labels per sectie van de homepage, zonder dat er iets herbouwd hoeft te worden.</p>
          </div>
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Media</span>
            <h3>Foto-bibliotheek</h3>
            <p>Alle geüploade foto&apos;s op één plek, ook te gebruiken als je een wijn zonder webshop-koppeling een eigen foto wilt geven.</p>
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
            <summary>Een dag (deels) blokkeren</summary>
            <div className="a-help-howto-body">
              <ol>
                <li>Ga naar <strong>Beschikbaarheid</strong> en klik op de datum in de kalender.</li>
                <li>
                  Zet <strong>hele dag dicht</strong> aan voor een vakantiedag, of vink specifieke tijdslots aan/uit
                  voor een gedeeltelijke sluiting.
                </li>
                <li>Opslaan: dit is direct zichtbaar op de site, boekingen op geblokkeerde tijden zijn niet meer mogelijk.</li>
              </ol>
            </div>
          </details>
          <details className="a-help-howto">
            <summary>Een wijn bijwerken</summary>
            <div className="a-help-howto-body">
              <p>
                De wijnenpagina en de wijndetailpagina&apos;s zijn een spiegel van Shopify: alles wat je in Shopify
                aanpast (foto, prijs, voorraad, tekstvelden onder &ldquo;Productmetavelden&rdquo;) verschijnt
                automatisch op de site, meestal binnen 5 minuten. Er is nergens meer een aparte plek waar je een wijn
                nogmaals moet invoeren.
              </p>
              <ul>
                <li>Wijn op de site tonen/verbergen: zet 'm in/uit de collectie <strong>All our wines</strong> in Shopify.</li>
                <li>
                  De 5 uitgelichte wijnen op de homepage: beheer je via de collectie <strong>Homepage</strong> in
                  Shopify (Producten → Collecties). Sleep daar de volgorde, of voeg een wijn toe/verwijder er een.
                </li>
                <li>
                  Tekstvelden zoals het verhaal, wijn-spijs advies, druif en streek staan onder &ldquo;Productmetavelden&rdquo;
                  op de productpagina in Shopify.
                </li>
              </ul>
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
