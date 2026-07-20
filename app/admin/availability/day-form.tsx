// app/admin/availability/day-form.tsx
"use client";

import { useState } from "react";
import { saveDayAvailability } from "./actions";

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

  return (
    <form action={saveDayAvailability.bind(null, date)} className="a-card" style={{ padding: "1.25rem" }}>
      <label className="a-checkbox-row">
        <input
          type="checkbox"
          name="isFullDay"
          className="a-checkbox"
          checked={isFullDay}
          onChange={(event) => setIsFullDay(event.target.checked)}
        />
        <span className="a-label">Deze hele dag niet beschikbaar</span>
      </label>

      <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {[1, 2, 3, 4].map((slotNumber) => (
          <div className="a-field" key={slotNumber}>
            <label className="a-label" htmlFor={`slot${slotNumber}`}>
              Tijdslot {slotNumber}
            </label>
            <input
              id={`slot${slotNumber}`}
              name={`slot${slotNumber}`}
              type="text"
              className="a-input"
              placeholder="Bijv. 14:00-17:00 - besloten feest"
              defaultValue={initialSlots[slotNumber - 1] ?? ""}
              disabled={isFullDay}
            />
          </div>
        ))}
        <span className="a-hint">
          Vul in wanneer jullie op deze dag dicht zijn voor een deel van de tijd. De rest van de dag blijft
          gewoon boekbaar. Laat leeg wat niet van toepassing is.
        </span>
      </div>

      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem" }}>
        <button type="submit" className="a-btn a-btn--primary">
          Opslaan
        </button>
      </div>
    </form>
  );
}
