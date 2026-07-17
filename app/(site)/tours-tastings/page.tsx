// app/(site)/tours-tastings/page.tsx
import Link from "next/link";
import { submitTastingInquiry } from "./actions";

export const dynamic = "force-dynamic";

const PREFERRED_PERIODS = ["Geen voorkeur", "Vrijdagmiddag", "Vrijdagavond", "Zaterdagmiddag", "Zaterdagavond"];

const OCCASIONS = [
  "Geen speciale gelegenheid",
  "Verjaardag",
  "Date night",
  "Vriendengroep",
  "Teamuitje",
  "Anders",
];

export default async function ToursTastingsPage({
  searchParams,
}: {
  searchParams: Promise<{ verzonden?: string; fout?: string }>;
}) {
  const { verzonden, fout } = await searchParams;

  return (
    <>
      <section className="tastings-hero">
        <div className="tastings-hero-media">
          <img src="/assets/hero-winery.png" alt="Interieur van de winery, tanks en vaten in avondlicht" />
        </div>
        <nav className="tastings-hero-top">
          <div>
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Tours &amp; Tastings</span>
          </div>
          <div>Amsterdam</div>
        </nav>
        <div className="tastings-hero-body">
          <div className="tastings-label">Ontdek Chateau</div>
          <h1 className="tastings-hero-title">
            Tour &amp;<em>tasting</em>
          </h1>
          <p className="tastings-hero-sub">
            70 minuten tussen de tanks. Zes wijnen op tafel. Een middag die je proeft in plaats van leest.
          </p>
        </div>
        <div className="tastings-scroll-cue">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </section>

      <section className="tastings-opening">
        <p>Midden in de stad wordt hier wijn gemaakt, van tank tot glas. Wij laten je proeven wat er ontstaat.</p>
      </section>

      <section className="tastings-gang">
        <div className="tastings-gang-grid">
          <div className="tastings-gang-text">
            <div className="num">01 &mdash; De tour</div>
            <h2>
              Tussen de
              <br />
              tanks
            </h2>
            <p>
              Een tour van 70 minuten door de winery. Je ziet hoe de druiven hier worden verwerkt tot wijn, van tank
              tot fles, en hoort het verhaal achter Chateau Amsterdam.
            </p>
          </div>
          <div className="tastings-gang-cluster">
            <div className="main">
              <img src="/assets/step-makerij.png" alt="Winemaker controleert wijn tussen de RVS tanks" />
            </div>
            <div className="detail">
              <img src="/assets/step-druif.png" alt="Handen die druiven sorteren" />
            </div>
          </div>
        </div>
      </section>

      <section className="tastings-gang reverse">
        <div className="tastings-gang-grid">
          <div className="tastings-gang-cluster">
            <div className="main">
              <img src="/assets/path-taste.png" alt="Proeverij van vier wijnen met bites op een wijnvat" />
            </div>
            <div className="detail">
              <img src="/assets/step-druif.png" alt="Handen die druiven sorteren" />
            </div>
          </div>
          <div className="tastings-gang-text">
            <div className="num">02 &mdash; De tasting</div>
            <h2>
              Zes wijnen,
              <br />
              &eacute;&eacute;n tafel
            </h2>
            <p>
              Na de tour proef je 6 wijnen met een kleine snack erbij. Dieetwensen of allergie&euml;n? Laat het weten
              bij je aanvraag, dan houden we er rekening mee.
            </p>
          </div>
        </div>
      </section>

      <section className="tastings-strip">
        <div className="tastings-strip-inner">
          <div className="tastings-strip-item">
            <div className="n">70 min</div>
            <div className="d">Tour &amp; tasting samen</div>
          </div>
          <div className="tastings-strip-item">
            <div className="n">6</div>
            <div className="d">Wijnen om te proeven</div>
          </div>
          <div className="tastings-strip-item">
            <div className="n">20%</div>
            <div className="d">Korting in de winkel nadien</div>
          </div>
          <div className="tastings-strip-item">
            <div className="n">&euro;55</div>
            <div className="d">Per persoon</div>
          </div>
        </div>
      </section>

      <section className="tastings-reserve" id="reserveren">
        <div className="tastings-reserve-media">
          <img src="/assets/place-hal.png" alt="Chateau Amsterdam bij avond, aan het water" />
        </div>
        <div className="tastings-reserve-inner">
          <div className="tastings-reserve-head">
            <div className="tastings-label">Reserveren</div>
            <h2>
              Boek je plek
              <br />
              tussen de tanks.
            </h2>
            <p>We bevestigen je aanvraag persoonlijk.</p>
          </div>
          <div className="tastings-form-wrap">
            {verzonden ? (
              <p className="tastings-form-success">Bedankt voor je aanvraag. We nemen zo snel mogelijk contact op.</p>
            ) : (
              <form action={submitTastingInquiry}>
                {fout ? <p className="tastings-form-error">{fout}</p> : null}
                <div className="tastings-form-row">
                  <div className="tastings-field">
                    <label>
                      <span className="fn">01</span>
                      <span className="fl">Aantal personen</span>
                    </label>
                    <input required type="number" name="partySize" min={1} max={20} defaultValue={2} className="tastings-input" />
                  </div>
                  <div className="tastings-field">
                    <label>
                      <span className="fn">02</span>
                      <span className="fl">Datum</span>
                    </label>
                    <input required type="date" name="requestedDate" className="tastings-input" />
                  </div>
                </div>
                <div className="tastings-form-row">
                  <div className="tastings-field">
                    <label>
                      <span className="fn">03</span>
                      <span className="fl">Voorkeursmoment</span>
                    </label>
                    <select name="preferredPeriod" defaultValue={PREFERRED_PERIODS[0]} className="tastings-input">
                      {PREFERRED_PERIODS.map((period) => (
                        <option key={period}>{period}</option>
                      ))}
                    </select>
                  </div>
                  <div className="tastings-field">
                    <label>
                      <span className="fn">04</span>
                      <span className="fl">Gelegenheid (optioneel)</span>
                    </label>
                    <select name="occasion" defaultValue={OCCASIONS[0]} className="tastings-input">
                      {OCCASIONS.map((occasion) => (
                        <option key={occasion}>{occasion}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="tastings-form-row">
                  <div className="tastings-field">
                    <label>
                      <span className="fn">05</span>
                      <span className="fl">Naam</span>
                    </label>
                    <input required type="text" name="name" placeholder="Voor- en achternaam" className="tastings-input" />
                  </div>
                  <div className="tastings-field">
                    <label>
                      <span className="fn">06</span>
                      <span className="fl">E-mailadres</span>
                    </label>
                    <input required type="email" name="email" placeholder="naam@voorbeeld.nl" className="tastings-input" />
                  </div>
                </div>
                <div className="tastings-field">
                  <label>
                    <span className="fn">07</span>
                    <span className="fl">Telefoonnummer</span>
                  </label>
                  <input type="tel" name="phone" placeholder="06 12345678" className="tastings-input" />
                </div>
                <div className="tastings-field">
                  <label>
                    <span className="fn">08</span>
                    <span className="fl">Allergie&euml;n, dieetwensen of opmerkingen</span>
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Bijvoorbeeld: notenallergie, vegetarisch, of iets anders dat we moeten weten."
                    className="tastings-input"
                  />
                </div>
                <button type="submit" className="tastings-submit">
                  Verstuur aanvraag
                </button>
              </form>
            )}
            <p className="tastings-note">Met een groep groter dan 10 personen? Neem contact op voor een groepsaanbod op maat.</p>
          </div>
        </div>
      </section>
    </>
  );
}
