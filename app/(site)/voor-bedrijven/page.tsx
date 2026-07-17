// app/(site)/voor-bedrijven/page.tsx
import type { Metadata } from "next";
import { VoorBedrijvenContent } from "@/components/voor-bedrijven-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Voor bedrijven · Chateau Amsterdam",
  description:
    "Zakelijke tastings, private label, events en groothandel bij de urban winery van Amsterdam-Noord. Eén aanspreekpunt, tien minuten van Amsterdam CS.",
  openGraph: {
    title: "Voor bedrijven · Chateau Amsterdam",
    description: "Wijn die je bedrijf een verhaal geeft. Eén partner, geproduceerd tien minuten van Amsterdam CS.",
    images: ["/assets/path-pour.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voor bedrijven · Chateau Amsterdam",
    description: "Wijn die je bedrijf een verhaal geeft.",
    images: ["/assets/path-pour.jpg"],
  },
};

export default async function VoorBedrijvenPage({
  searchParams,
}: {
  searchParams: Promise<{ verzonden?: string; fout?: string }>;
}) {
  const { verzonden, fout } = await searchParams;

  return <VoorBedrijvenContent verzonden={verzonden} fout={fout} />;
}
