// app/(site)/algemene-voorwaarden/page.tsx
import type { Metadata } from "next";
import { TermsContent } from "@/components/terms-content";

export const metadata: Metadata = {
  title: "Algemene voorwaarden · Chateau Amsterdam",
  description: "De algemene voorwaarden voor het gebruik van chateau.amsterdam en onze diensten.",
};

export default function AlgemeneVoorwaardenPage() {
  return <TermsContent />;
}
