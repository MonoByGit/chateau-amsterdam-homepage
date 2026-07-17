export type BusinessInquiryInput = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  occasion: string;
  notes: string;
};

export function validateBusinessInquiry(input: BusinessInquiryInput): string | null {
  if (!input.name.trim()) {
    return "Naam is verplicht.";
  }
  if (!input.email.trim()) {
    return "E-mailadres is verplicht.";
  }
  if (!input.occasion.trim()) {
    return "Kies een onderwerp.";
  }
  return null;
}
