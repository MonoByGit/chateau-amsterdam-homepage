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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PARTY_SIZE = 20;

export function validateTastingInquiry(input: TastingInquiryInput): string | null {
  if (!input.name.trim()) {
    return "name_required";
  }
  if (!input.email.trim()) {
    return "email_required";
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    return "email_invalid";
  }
  const partySize = Number(input.partySize);
  if (!input.partySize.trim() || !Number.isInteger(partySize) || partySize < 1 || partySize > MAX_PARTY_SIZE) {
    return "party_size_invalid";
  }
  if (!input.requestedDate.trim()) {
    return "date_required";
  }
  const requestedDate = new Date(`${input.requestedDate}T00:00:00`);
  if (Number.isNaN(requestedDate.getTime())) {
    return "date_invalid";
  }
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (requestedDate < startOfToday) {
    return "date_past";
  }
  return null;
}
