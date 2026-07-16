import type { Metadata } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/language";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getContent } from "@/lib/content/get-content";
import { HEADER_DEFAULTS, FOOTER_DEFAULTS } from "@/lib/content/defaults";
import "../globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://chateau.amsterdam"),
  title: "Chateau Amsterdam · Urban Winery Amsterdam-Noord",
  description:
    "Eerste urban winery van Nederland, gevestigd in Amsterdam-Noord. Druiven uit heel Europa, gemaakt aan het IJ. Boek een tasting of proeverij tussen de stalen tanks.",
  openGraph: {
    title: "Chateau Amsterdam · Urban Winery",
    description: "Geen wijngaard. Wel wijn. Druiven uit heel Europa, wijn gemaakt aan het IJ in Amsterdam-Noord.",
    images: ["/assets/place-hal.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chateau Amsterdam · Urban Winery",
    description: "Geen wijngaard. Wel wijn. Druiven uit heel Europa, wijn gemaakt aan het IJ in Amsterdam-Noord.",
    images: ["/assets/place-hal.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Winery",
  name: "Chateau Amsterdam",
  image: "https://chateau.amsterdam/assets/place-hal.png",
  "@id": "https://chateau.amsterdam/#winery",
  url: "https://chateau.amsterdam/",
  telephone: "+31200000000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Johan van Hasseltweg",
    addressLocality: "Amsterdam-Noord",
    addressRegion: "Noord-Holland",
    postalCode: "1021",
    addressCountry: "NL",
  },
  geo: { "@type": "GeoCoordinates", latitude: 52.3914, longitude: 4.9131 },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "12:00",
    closes: "18:30",
  },
  sameAs: ["https://www.instagram.com/chateauamsterdam/", "https://www.linkedin.com/company/chateau-amsterdam/"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerContent = await getContent("home", "header", HEADER_DEFAULTS);
  const footerContent = await getContent("home", "footer", FOOTER_DEFAULTS);

  return (
    <html lang="nl" className={`${archivo.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body data-pattern="arcering" style={{ "--pattern-o": 0.04 } as React.CSSProperties}>
        <LanguageProvider>
          <div className="grain" />
          <div className="bg-pattern" />
          <SiteHeader content={headerContent} />
          <main id="main-content">{children}</main>
          <SiteFooter content={footerContent} />
        </LanguageProvider>
      </body>
    </html>
  );
}
