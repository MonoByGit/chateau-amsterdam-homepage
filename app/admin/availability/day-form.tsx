// app/admin/availability/day-form.tsx
"use client";

import { useState } from "react";
import { saveDayAvailability } from "./actions";

const FIXED_SLOTS = [
  { id: "slot1", label: "15:00 uur (70 min. tour & tasting)" },
  { id: "slot2", label: "17:00 uur (70 min. tour & tasting)" },
  { id: "slot3", label: "19:00 uur (70 min. tour & tasting)" },
];

export function DayForm({
  date,
  initialIsFullDay,
  initialSlots,
}: {
  date: string;
  initialIsFullDay: boolean;
  initialSlots: string[];
}) {
  const [isFullDay, setIsFullDay] = useState(initialIsFullDay);

  // Check if a fixed slot label is currently blocked in initialSlots
  const isSlotBlocked = (slotLabel: string) => {
    return initialSlots.some((s) => s.toLowerCase().includes(slotLabel.slice(0, 5).toLowerCase()));
  };

  const [blockedSlots, setBlockedSlots] = useState<Record<string, boolean>>({
    slot1: isSlotBlocked("15:00"),
    slot2: isSlotBlocked("17:00"),
    slot3: isSlotBlocked("19:00"),
  });

  const customSlotInitial = initialSlots.find(
    (s) => s && !s.includes("15:00") && !s.includes("17:00") && !s.includes("19:00")
  ) ?? "";

  return (
    <form action={saveDayAvailability.bind(null, date)} className="a-card" style={{ padding: "1.25rem" }}>
      <label className="a-checkbox-row" style={{ paddingBottom: "1rem", borderBottom: "1px solid var(--a-border)" }}>
        <input
          type="checkbox"
          name="isFullDay"
          className="a-checkbox"
          checked={isFullDay}
          onChange={(event) => setIsFullDay(event.target.checked)}
        />
        <span className="a-label" style={{ fontWeight: 600 }}>
          🚫 Deze hele dag niet beschikbaar (volledig gesloten)
        </span>
      </label>

      <div style={{ marginTop: "1.25rem", opacity: isFullDay ? 0.4 : 1, pointerEvents: isFullDay ? "none" : "auto" }}>
        <div className="a-label" style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
          Vaste Tijdslots Blokkeren
        </div>
        <p className="a-hint" style={{ marginBottom: "1rem" }}>
          Vink hieronder aan welke tijdslots op deze dag NIET beschikbaar moeten zijn voor boekingen.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {FIXED_SLOTS.map((slot) => {
            const isChecked = blockedSlots[slot.id] ?? false;
            return (
              <label key={slot.id} className="a-checkbox-row" style={{ background: isChecked ? "rgba(229, 62, 62, 0.08)" : "transparent", padding: "0.5rem 0.75rem", borderRadius: "var(--a-r)" }}>
                <input
                  type="checkbox"
                  className="a-checkbox"
                  checked={isChecked}
                  onChange={(e) => setBlockedSlots((prev) => ({ ...prev, [slot.id]: e.target.checked }))}
                />
                <input
                  type="hidden"
                  name={slot.id}
                  value={isChecked ? slot.label : ""}
                />
                <span className="a-label">
                  {slot.label} {isChecked ? <strong style={{ color: "var(--a-danger)", marginLeft: "0.5rem" }}>— Geblokkeerd</strong> : null}
                </span>
              </label>
            );
          })}
        </div>

        <div className="a-field" style={{ marginTop: "1.25rem" }}>
          <label className="a-label" htmlFor="slot4">
            Aangepaste reden of extra uitzondering (optioneel)
          </label>
          <input
            id="slot4"
            name="slot4"
            type="text"
            className="a-input"
            placeholder="Bijv. Besloten evenement / Onderhoud"
            defaultValue={customSlotInitial}
            disabled={isFullDay}
          />
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <button type="submit" className="a-btn a-btn--primary">
          Opslaan
        </button>
      </div>
    </form>
  );
}
