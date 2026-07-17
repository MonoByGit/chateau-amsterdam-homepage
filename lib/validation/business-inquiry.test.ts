import { describe, expect, it } from "vitest";
import { validateBusinessInquiry } from "./business-inquiry";

function validInput() {
  return {
    name: "Jan Jansen",
    companyName: "Acme B.V.",
    email: "jan@acme.nl",
    phone: "",
    occasion: "Zakelijke tasting of borrel",
    groupSize: "",
    notes: "",
  };
}

describe("validateBusinessInquiry", () => {
  it("accepts a fully filled-in inquiry", () => {
    expect(validateBusinessInquiry(validInput())).toBeNull();
  });

  it("accepts an empty phone, groupSize and notes, all optional", () => {
    expect(validateBusinessInquiry({ ...validInput(), phone: "", groupSize: "", notes: "" })).toBeNull();
  });

  it("accepts a valid group size", () => {
    expect(validateBusinessInquiry({ ...validInput(), groupSize: "25" })).toBeNull();
  });

  it("rejects a missing name", () => {
    expect(validateBusinessInquiry({ ...validInput(), name: "  " })).toBe("name_required");
  });

  it("rejects a missing email", () => {
    expect(validateBusinessInquiry({ ...validInput(), email: "" })).toBe("email_required");
  });

  it("rejects a malformed email", () => {
    expect(validateBusinessInquiry({ ...validInput(), email: "not-an-email" })).toBe("email_invalid");
  });

  it("rejects a missing occasion", () => {
    expect(validateBusinessInquiry({ ...validInput(), occasion: "" })).toBe("occasion_required");
  });

  it("rejects a non-numeric group size", () => {
    expect(validateBusinessInquiry({ ...validInput(), groupSize: "veel" })).toBe("group_size_invalid");
  });

  it("rejects a group size of zero or less", () => {
    expect(validateBusinessInquiry({ ...validInput(), groupSize: "0" })).toBe("group_size_invalid");
  });
});
