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

  it("rejects a missing name", () => {
    expect(validateTastingInquiry({ ...validInput(), name: "  " })).toBe("Naam is verplicht.");
  });

  it("rejects a missing email", () => {
    expect(validateTastingInquiry({ ...validInput(), email: "" })).toBe("E-mailadres is verplicht.");
  });

  it("rejects a missing party size", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "" })).toBe("Vul een geldig aantal personen in.");
  });

  it("rejects a party size of zero or less", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "0" })).toBe("Vul een geldig aantal personen in.");
  });

  it("rejects a non-numeric party size", () => {
    expect(validateTastingInquiry({ ...validInput(), partySize: "twee" })).toBe("Vul een geldig aantal personen in.");
  });

  it("rejects a missing date", () => {
    expect(validateTastingInquiry({ ...validInput(), requestedDate: "" })).toBe("Kies een datum.");
  });
});
