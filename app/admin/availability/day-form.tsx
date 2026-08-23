// app/admin/availability/day-form.tsx
"use client";

import { useState } from "react";
import { saveDayAvailability } from "./actions";

const ALL_FIXED_SLOTS = [
  { id: "slot1", label: "12:00 uur (70 min. tour & tasting)", time: "12:00", saturdayOnly: true },
  { id: "slot2", label: "14:00 uur (70 min. tour & tasting)", time: "14:00" },
  { id: "slot3", label: "16:00 uur (70 min. tour & tasting)", time: "16:00" },
  { id: "slot4", label: "18:00 uur (70 min. tour & tasting)", time: "18:00" },
  { id: "slot5", label: "19:30 uur (70 min. tour & tasting)", time: "19:30", fridayAndSaturdayOnly: true },
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

  const [y, m, d] = date.split("-").map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay();
  const isSaturday = dayOfWeek === 6;
  const isFriday = dayOfWeek === 5;
  const fixedSlots = ALL_FIXED_SLOTS.filter((s) => {
    if (s.saturdayOnly) return isSaturday;
    if (s.fridayAndSaturdayOnly) return isFriday || isSaturday;
    return true;
  });

  // Check if a fixed slot label is currently blocked in initialSlots
  const isSlotBlocked = (slotTime: string) => {
    return initialSlots.some((s) => s.toLowerCase().includes(slotTime.toLowerCase()));
  };

  const [blockedSlots, setBlockedSlots] = useState<Record<string, boolean>>({
    slot1: isSlotBlocked("12:00"),
    slot2: isSlotBlocked("14:00"),
    slot3: isSlotBlocked("16:00"),
    slot4: isSlotBlocked("18:00"),
    slot5: isSlotBlocked("19:30"),
  });

  const customSlotInitial = initialSlots.find(
    (s) => s && !s.includes("12:00") && !s.includes("14:00") && !s.includes("16:00") && !s.includes("18:00") && !s.includes("19:30")
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
          {fixedSlots.map((slot) => {
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
          <label className="a-label" htmlFor="slot5">
            Aangepaste reden of extra uitzondering (optioneel)
          </label>
          <input
            id="slot5"
            name="slot5"
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
