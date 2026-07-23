// lib/ical/sync.test.ts
import { describe, expect, it } from "vitest";
import { parseIcalFeed } from "./sync";

describe("parseIcalFeed", () => {
  it("parses full-day and timed VEVENT entries correctly", () => {
    const icsSample = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.905292//EN
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260815
DTEND;VALUE=DATE:20260816
SUMMARY:Zomersluiting Winery
END:VEVENT
BEGIN:VEVENT
DTSTART:20260820T150000Z
DTEND:20260820T170000Z
SUMMARY:Besloten tasting 15:00
END:VEVENT
END:VCALENDAR`;

    const events = parseIcalFeed(icsSample);
    expect(events).toHaveLength(2);

    expect(events[0]).toEqual({
      summary: "Zomersluiting Winery",
      startDateIso: "2026-08-15",
      startTime: undefined,
      isAllDay: true,
    });

    expect(events[1]).toEqual({
      summary: "Besloten tasting 15:00",
      startDateIso: "2026-08-20",
      startTime: "15:00",
      isAllDay: false,
    });
  });

  it("handles unfolded multi-line ICS headers", () => {
    const icsFolded = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260901T170000Z
SUMMARY:Grote Bedrijfsborrel
  Chateau Amsterdam
END:VEVENT
END:VCALENDAR`;

    const events = parseIcalFeed(icsFolded);
    expect(events).toHaveLength(1);
    expect(events[0].summary).toEqual("Grote Bedrijfsborrel Chateau Amsterdam");
    expect(events[0].startDateIso).toEqual("2026-09-01");
  });
});
