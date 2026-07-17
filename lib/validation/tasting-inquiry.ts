export type TastingInquiryInput = {
  name: string;
  email: string;
  phone: string;
  partySize: string;
  requestedDate: string;
  preferredPeriod: string;
  occasion: string;
  notes: string;
};

export function validateTastingInquiry(input: TastingInquiryInput): string | null {
  if (!input.name.trim()) {
    return "Naam is verplicht.";
  }
  if (!input.email.trim()) {
    return "E-mailadres is verplicht.";
  }
  const partySize = Number(input.partySize);
  if (!input.partySize.trim() || !Number.isInteger(partySize) || partySize < 1) {
    return "Vul een geldig aantal personen in.";
  }
  if (!input.requestedDate.trim()) {
    return "Kies een datum.";
  }
  return null;
}
