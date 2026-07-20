// app/(site)/privacybeleid/page.tsx
import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacybeleid · Chateau Amsterdam",
  description: "Hoe Chateau Amsterdam persoonsgegevens verzamelt, gebruikt en beschermt.",
};

// The shared layout fetches header/footer content from the database; force
// this route to render per-request like the rest of the site, rather than
// prerendering at build time when the DB isn't reachable (Railway builds
// run without access to the private network).
export const dynamic = "force-dynamic";

export default function PrivacybeleidPage() {
  return <PrivacyPolicyContent />;
}
