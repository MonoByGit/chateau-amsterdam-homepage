// app/(site)/voor-bedrijven/page.tsx
import Link from "next/link";
import { BusinessInquiry } from "@/components/business-inquiry";

export const dynamic = "force-dynamic";

export default async function VoorBedrijvenPage({
  searchParams,
}: {
  searchParams: Promise<{ verzonden?: string; fout?: string }>;
}) {
  const { verzonden, fout } = await searchParams;

  return (
    <>
      <section className="bd-intro">
        <nav className="bd-breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <span className="current">Voor bedrijven</span>
        </nav>
        <div className="bd-intro-grid">
          <div className="bd-intro-text">
            <div className="bd-label">Zakelijk &amp; horeca</div>
            <h1>
              Wijn die je bedrijf
              <br />
              een <em>verhaal</em> geeft
            </h1>
            <p>
              Van de borrel tussen de tanks tot je naam op de fles. Eén partner, geproduceerd tien minuten van
              Amsterdam CS. Kies hieronder waar je aan denkt, wij nemen het van daar over.
            </p>
          </div>
          <div className="bd-intro-photo">
            <img src="/assets/path-pour.png" alt="Lange gedekte tafel met kaarslicht in de winery-hal" />
          </div>
        </div>
      </section>

      <section className="bd-body" id="aanvraag">
        <BusinessInquiry verzonden={verzonden} fout={fout} />
      </section>

      <section className="bd-strip">
        <div className="bd-strip-inner">
          <div className="bd-strip-item">
            <div className="n">1</div>
            <div className="d">Aanspreekpunt, van begin tot levering</div>
          </div>
          <div className="bd-strip-item">
            <div className="n">10 min</div>
            <div className="d">Van Amsterdam CS, midden in Noord</div>
          </div>
          <div className="bd-strip-item">
            <div className="n">100%</div>
            <div className="d">Geproduceerd in de eigen winery</div>
          </div>
        </div>
      </section>
    </>
  );
}
