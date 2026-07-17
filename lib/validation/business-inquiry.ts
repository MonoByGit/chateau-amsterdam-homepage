export type BusinessInquiryInput = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  occasion: string;
  groupSize: string;
  notes: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBusinessInquiry(input: BusinessInquiryInput): string | null {
  if (!input.name.trim()) {
    return "name_required";
  }
  if (!input.email.trim()) {
    return "email_required";
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    return "email_invalid";
  }
  if (!input.occasion.trim()) {
    return "occasion_required";
  }
  if (input.groupSize.trim()) {
    const groupSize = Number(input.groupSize);
    if (!Number.isInteger(groupSize) || groupSize < 1) {
      return "group_size_invalid";
    }
  }
  return null;
}
