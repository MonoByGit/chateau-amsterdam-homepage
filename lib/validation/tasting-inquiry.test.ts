import { describe, expect, it } from "vitest";
import { validateTastingInquiry } from "./tasting-inquiry";

function validInput() {
  return {
    name: "Sanne de Vries",
    email: "sanne@example.com",
    phone: "",
    partySize: "2",
    requestedDate: "2026-08-14",
    preferredPeriod: "Geen voorkeur",
    occasion: "Geen speciale gelegenheid",
    notes: "",
  };
}

describe("validateTastingInquiry", () => {
  it("accepts a fully filled-in inquiry", () => {
    expect(validateTastingInquiry(validInput())).toBeNull();
  });

  it("accepts an empty phone, occasion and notes, all optional", () => {
    expect(validateTastingInquiry({ ...validInput(), phone: "", occasion: "", notes: "" })).toBeNull();
  });

  it("accepts the max party size of 20", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "20" })).toBeNull();
  });

  it("rejects a missing name", () => {
    expect(validateTastingInquiry({ ...validInput(), name: "  " })).toBe("name_required");
  });

  it("rejects a missing email", () => {
    expect(validateTastingInquiry({ ...validInput(), email: "" })).toBe("email_required");
  });

  it("rejects a malformed email", () => {
    expect(validateTastingInquiry({ ...validInput(), email: "not-an-email" })).toBe("email_invalid");
  });

  it("rejects a missing party size", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "" })).toBe("party_size_invalid");
  });

  it("rejects a party size of zero or less", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "0" })).toBe("party_size_invalid");
  });

  it("rejects a non-numeric party size", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "twee" })).toBe("party_size_invalid");
  });

  it("rejects a party size above the 20-person self-service cap", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "21" })).toBe("party_size_invalid");
  });

  it("rejects a missing date", () => {
    expect(validateTastingInquiry({ ...validInput(), requestedDate: "" })).toBe("date_required");
  });

  it("rejects a malformed date", () => {
    expect(validateTastingInquiry({ ...validInput(), requestedDate: "not-a-date" })).toBe("date_invalid");
  });

  it("rejects a date in the past", () => {
    expect(validateTastingInquiry({ ...validInput(), requestedDate: "2020-01-01" })).toBe("date_past");
  });
});
