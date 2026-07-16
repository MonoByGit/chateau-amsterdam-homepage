import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./language";

function Probe() {
  const { lang, setLang } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang("en")}>to-en</button>
      <button onClick={() => setLang("nl")}>to-nl</button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to nl when there is no saved preference and navigator.language is not English", () => {
    vi.stubGlobal("navigator", { language: "nl-NL" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("nl");
  });

  it("defaults to en when navigator.language starts with en and there is no saved preference", () => {
    vi.stubGlobal("navigator", { language: "en-US" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("en");
  });

  it("prefers the saved localStorage language over navigator.language", () => {
    localStorage.setItem("preferred-lang", "en");
    vi.stubGlobal("navigator", { language: "nl-NL" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("en");
  });

  it("updates state and persists to localStorage when setLang is called", () => {
    vi.stubGlobal("navigator", { language: "nl-NL" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText("to-en"));
    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(localStorage.getItem("preferred-lang")).toBe("en");
  });

  it("updates document.documentElement.lang when the language changes", () => {
    vi.stubGlobal("navigator", { language: "nl-NL" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText("to-en"));
    expect(document.documentElement.lang).toBe("en");
  });

  it("falls back to navigator.language when the saved preference is unrecognized", () => {
    localStorage.setItem("preferred-lang", "fr");
    vi.stubGlobal("navigator", { language: "en-US" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("en");
  });
});
