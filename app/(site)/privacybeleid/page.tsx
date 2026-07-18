// app/(site)/privacybeleid/page.tsx
import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacybeleid · Chateau Amsterdam",
  description: "Hoe Chateau Amsterdam persoonsgegevens verzamelt, gebruikt en beschermt.",
};

export default function PrivacybeleidPage() {
  return <PrivacyPolicyContent />;
}
