import { describe, it, expect } from "vitest";
import { renderLoginCodeEmail } from "./templates";

describe("renderLoginCodeEmail", () => {
  it("renders a 6-digit code with clean spacing and 15-minute expiry note", () => {
    const { subject, html } = renderLoginCodeEmail({
      code: "839204",
      expiresMinutes: 15,
      magicLinkUrl: "https://chateau.amsterdam/api/auth/magic?token=abc123token",
    });

    expect(subject).toContain("839 204");
    expect(subject).toContain("inlogcode");

    expect(html).toContain("839 204");
    expect(html).toContain("15 minuten");
    expect(html).toContain("3 pogingen");
    expect(html).toContain("https://chateau.amsterdam/api/auth/magic?token=abc123token");
    expect(html).toContain("Chateau Amsterdam");
  });

  it("renders without magic link button if no url provided", () => {
    const { subject, html } = renderLoginCodeEmail({
      code: "123456",
    });

    expect(subject).toContain("123 456");
    expect(html).toContain("123 456");
    expect(html).not.toContain("Direct Inloggen via Link");
  });
});
