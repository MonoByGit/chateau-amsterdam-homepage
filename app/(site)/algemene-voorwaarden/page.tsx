// app/(site)/algemene-voorwaarden/page.tsx
import type { Metadata } from "next";
import { TermsContent } from "@/components/terms-content";

export const metadata: Metadata = {
  title: "Algemene voorwaarden · Chateau Amsterdam",
  description: "De algemene voorwaarden voor het gebruik van chateau.amsterdam en onze diensten.",
};

// The shared layout fetches header/footer content from the database; force
// this route to render per-request like the rest of the site, rather than
// prerendering at build time when the DB isn't reachable (Railway builds
// run without access to the private network).
export const dynamic = "force-dynamic";

export default function AlgemeneVoorwaardenPage() {
  return <TermsContent />;
}
