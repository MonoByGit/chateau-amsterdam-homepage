// lib/validation/wine-input.test.ts
import { describe, expect, it } from "vitest";
import { validateWineInput } from "./wine-input";

function validInput() {
  return {
    name: "Riesling",
    metaNl: "Wit · Pfalz, DE",
    metaEn: "White · Pfalz, DE",
    tagNl: "de klassieker",
    tagEn: "the classic",
    imageId: null,
    shopifyHandle: "riesling",
    isActive: true,
    descriptionNl: "",
    descriptionEn: "",
    grapes: "",
    vintage: "",
    wineTypeNl: "",
    wineTypeEn: "",
    regionNl: "",
    regionEn: "",
    farmingMethodNl: "",
    farmingMethodEn: "",
    vinificationNl: "",
    vinificationEn: "",
    abv: "",
    foodPairingNl: "",
    foodPairingEn: "",
  };
}

describe("validateWineInput", () => {
  it("accepts a fully filled-in wine", () => {
    expect(validateWineInput(validInput())).toBeNull();
  });

  it("rejects a missing name", () => {
    expect(validateWineInput({ ...validInput(), name: "  " })).toBe("Naam is verplicht.");
  });

  it("rejects a missing Shopify handle", () => {
    expect(validateWineInput({ ...validInput(), shopifyHandle: "" })).toBe("Shopify handle is verplicht.");
  });

  it("rejects a non-numeric alcohol percentage", () => {
    const input = { ...validInput(), abv: "niet een getal" };
    expect(validateWineInput(input)).toBe("Alcoholpercentage moet een getal zijn.");
  });

  it("accepts an empty alcohol percentage", () => {
    const input = { ...validInput(), abv: "" };
    expect(validateWineInput(input)).toBeNull();
  });
});
