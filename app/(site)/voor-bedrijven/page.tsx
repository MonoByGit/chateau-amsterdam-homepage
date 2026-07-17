// app/(site)/voor-bedrijven/page.tsx
import Link from "next/link";
import { submitBusinessInquiry } from "./actions";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    n: "N°01",
    label: "Tastings & borrels",
    title: "Zet je team tussen de tanks",
    body: "Een borrel of teamuitje in de winery zelf, met een verhaal bij elk glas. Van 10 tot 60 personen, met of zonder bites erbij. Precies zo informeel of verzorgd als je zoekt.",
    photoAlt: "foto: tasting tussen de tanks",
    flip: false,
  },
  {
    n: "N°02",
    label: "Private label & relatiegeschenken",
    title: "Jullie naam op de fles",
    body: "Van een handvol flessen als relatiegeschenk tot een volledige oplage onder je eigen merk. Wij vinifiëren, jij bepaalt het etiket en het verhaal erachter.",
    photoAlt: "foto: eigen etiket",
    flip: true,
  },
  {
    n: "N°03",
    label: "Events & locatieverhuur",
    title: "De winery als decor",
    body: "Productlancering, feest of filmlocatie: de hal leent zich voor 20 tot 150 gasten, inclusief bar, geluid en de sfeer van een werkende winery middenin Amsterdam-Noord.",
    photoAlt: "foto: event in de hal",
    flip: false,
  },
  {
    n: "N°04",
    label: "Groothandel voor horeca",
    title: "Vaste plek op de kaart",
    body: "Structurele levering voor wijnkaart of schap, met staffelkorting vanaf de eerste doos. Eén contactpersoon, korte lijnen, altijd op voorraad.",
    photoAlt: "foto: levering aan horeca",
    flip: true,
  },
] as const;

export default async function VoorBedrijvenPage({
  searchParams,
}: {
  searchParams: Promise<{ verzonden?: string; fout?: string }>;
}) {
  const { verzonden, fout } = await searchParams;

  return (
    <>
      <nav className="wijnen-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span className="current">Voor bedrijven</span>
      </nav>

      <div className="zakelijk-intro">
        <div className="zakelijk-label">Zakelijk & horeca</div>
        <h1>
          Wijn die je bedrijf<br />
          een <em>verhaal</em> geeft
        </h1>
        <p>
          Van een borrel tussen de tanks tot je eigen label op het schap. Vier manieren waarop Chateau Amsterdam
          met je meedenkt, allemaal geproduceerd 10 minuten van Amsterdam CS.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div
          className="zakelijk-sec"
          key={section.n}
          style={section.flip ? { gridTemplateColumns: "1.1fr 0.9fr" } : undefined}
        >
          {section.flip ? (
            <>
              <div className="zakelijk-ph">{section.photoAlt}</div>
              <div>
                <span className="zakelijk-label">
                  {section.n} · {section.label}
                </span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="zakelijk-label">
                  {section.n} · {section.label}
                </span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
              <div className="zakelijk-ph">{section.photoAlt}</div>
            </>
          )}
        </div>
      ))}

      <div className="zakelijk-why">
        <span className="zakelijk-label">Waarom Chateau</span>
        <h2>
          Eén partner, van eerste <em>gesprek</em> tot levering
        </h2>
        <div className="zakelijk-stats">
          <div className="zakelijk-stat">
            <div className="num">1</div>
            <div className="desc">aanspreekpunt, van begin tot levering</div>
          </div>
          <div className="zakelijk-stat">
            <div className="num">10 min</div>
            <div className="desc">van Amsterdam CS, midden in Noord</div>
          </div>
          <div className="zakelijk-stat">
            <div className="num">100%</div>
            <div className="desc">geproduceerd in de eigen winery</div>
          </div>
        </div>
      </div>

      <div className="zakelijk-form-sec" id="aanvraag">
        <div>
          <span className="zakelijk-label">Aanvraag</span>
          <h2>Vertel ons waar je aan denkt</h2>
          <p>Eén formulier, rechtstreeks bij het team. Geen omweg via een mailbox die niemand leest.</p>
        </div>
        <div className="zakelijk-form-card">
          {verzonden ? (
            <p className="zakelijk-form-success">
              Bedankt. We nemen zo snel mogelijk contact op.
            </p>
          ) : (
            <form action={submitBusinessInquiry}>
              {fout ? <p className="zakelijk-form-error">{fout}</p> : null}
              <div className="row">
                <input required type="text" name="name" placeholder="Naam" className="zakelijk-input" />
                <input type="text" name="companyName" placeholder="Bedrijfsnaam" className="zakelijk-input" />
              </div>
              <div className="row">
                <input required type="email" name="email" placeholder="E-mail" className="zakelijk-input" />
                <input type="tel" name="phone" placeholder="Telefoon (optioneel)" className="zakelijk-input" />
              </div>
              <select required name="occasion" defaultValue="" className="zakelijk-input">
                <option value="" disabled>
                  Onderwerp, kies een categorie
                </option>
                <option>Zakelijke tasting of borrel</option>
                <option>Private label / relatiegeschenk</option>
                <option>Event of locatieverhuur</option>
                <option>Groothandel voor horeca</option>
                <option>Iets anders</option>
              </select>
              <textarea name="notes" rows={3} placeholder="Vertel iets over je aanvraag" className="zakelijk-input" />
              <button type="submit" className="btn btn--primary">
                Versturen <span className="arr">→</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
