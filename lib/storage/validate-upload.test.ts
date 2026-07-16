// lib/storage/validate-upload.test.ts
import { describe, expect, it } from "vitest";
import { validateUpload } from "./validate-upload";

describe("validateUpload", () => {
  it("accepts a JPEG under the size limit", () => {
    expect(validateUpload({ type: "image/jpeg", size: 1024 })).toBeNull();
  });

  it("accepts a file exactly at the 8MB limit", () => {
    expect(validateUpload({ type: "image/png", size: 8 * 1024 * 1024 })).toBeNull();
  });

  it("rejects an unsupported file type", () => {
    expect(validateUpload({ type: "application/pdf", size: 1024 })).toBe(
      'Bestandstype "application/pdf" wordt niet ondersteund. Gebruik JPEG, PNG of WebP.'
    );
  });

  it("rejects a file over the 8MB limit", () => {
    expect(validateUpload({ type: "image/webp", size: 8 * 1024 * 1024 + 1 })).toBe(
      "Bestand is te groot. Maximaal 8MB toegestaan."
    );
  });
});
