import { describe, expect, it } from "vitest";
import { validateBusinessInquiry } from "./business-inquiry";

function validInput() {
  return {
    name: "Jan Jansen",
    companyName: "Acme B.V.",
    email: "jan@acme.nl",
    phone: "",
    occasion: "Zakelijke tasting of borrel",
    notes: "",
  };
}

describe("validateBusinessInquiry", () => {
  it("accepts a fully filled-in inquiry", () => {
    expect(validateBusinessInquiry(validInput())).toBeNull();
  });

  it("accepts an empty phone and notes, both optional", () => {
    expect(validateBusinessInquiry({ ...validInput(), phone: "", notes: "" })).toBeNull();
  });

  it("rejects a missing name", () => {
    expect(validateBusinessInquiry({ ...validInput(), name: "  " })).toBe("Naam is verplicht.");
  });

  it("rejects a missing email", () => {
    expect(validateBusinessInquiry({ ...validInput(), email: "" })).toBe("E-mailadres is verplicht.");
  });

  it("rejects a missing occasion", () => {
    expect(validateBusinessInquiry({ ...validInput(), occasion: "" })).toBe("Kies een onderwerp.");
  });
});
