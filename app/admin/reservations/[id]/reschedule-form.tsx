// app/admin/reservations/[id]/reschedule-form.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { saveAndConfirmReservation } from "../actions";

const WEEKDAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

const MONTH_NAMES = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december"
];

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDutchDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return "Kies datum";
  const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
  return `${dayNames[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// Build standard time slots based on day of week (70 min fixed tours)
function getDaySlots(isoDate: string): { key: string; label: string }[] {
  const date = parseIsoDate(isoDate);
  const day = date ? date.getDay() : 4; // 0=Zo, 4=Do, 5=Vr, 6=Za

  if (day === 6) {
    // Saturday: 12:00, 14:00, 16:00, 18:00, 19:30
    return [
      { key: "12:00", label: "12:00 uur (70 min. tour & tasting)" },
      { key: "14:00", label: "14:00 uur (70 min. tour & tasting)" },
      { key: "16:00", label: "16:00 uur (70 min. tour & tasting)" },
      { key: "18:00", label: "18:00 uur (70 min. tour & tasting)" },
      { key: "19:30", label: "19:30 uur (70 min. tour & tasting)" },
    ];
  }

  if (day === 5) {
    // Friday: 14:00, 16:00, 18:00, 19:30
    return [
      { key: "14:00", label: "14:00 uur (70 min. tour & tasting)" },
      { key: "16:00", label: "16:00 uur (70 min. tour & tasting)" },
      { key: "18:00", label: "18:00 uur (70 min. tour & tasting)" },
      { key: "19:30", label: "19:30 uur (70 min. tour & tasting)" },
    ];
  }

  // Thursday (and other days): 14:00, 16:00, 18:00
  return [
    { key: "14:00", label: "14:00 uur (70 min. tour & tasting)" },
    { key: "16:00", label: "16:00 uur (70 min. tour & tasting)" },
    { key: "18:00", label: "18:00 uur (70 min. tour & tasting)" },
  ];
}

export function RescheduleForm({
  reservationId,
  initialDate,
  initialPeriod,
  initialPartySize,
  initialNotes,
  track,
}: {
  reservationId: string;
  initialDate: string | null;
  initialPeriod: string | null;
  initialPartySize: number;
  initialNotes: string | null;
  track: string;
}) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || toIsoDate(today));
  const [partySize, setPartySize] = useState<number>(initialPartySize || 2);
  const [notes, setNotes] = useState<string>(initialNotes || "");

  // Time slot management (only official fixed 70 min tours)
  const daySlots = getDaySlots(selectedDate);
  const matchingInitialSlot = daySlots.find(s => s.label === initialPeriod || s.key === initialPeriod);
  const [selectedSlot, setSelectedSlot] = useState<string>(
    matchingInitialSlot ? matchingInitialSlot.label : (initialPeriod || daySlots[0]?.label || "14:00 uur (70 min. tour & tasting)")
  );

  // Calendar popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const parsedDate = parseIsoDate(selectedDate) || today;
  const [viewMonth, setViewMonth] = useState<Date>(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    if (!isCalendarOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  // When date changes, adjust slot if it's no longer valid in default list
  const handleDateChange = (newIso: string) => {
    setSelectedDate(newIso);
    setIsCalendarOpen(false);
    const newSlots = getDaySlots(newIso);
    if (!newSlots.some(s => s.label === selectedSlot)) {
      setSelectedSlot(newSlots[0]?.label || "14:00 uur (70 min. tour & tasting)");
    }
  };

  // Calendar calculations
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first index

  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      className="a-card"
      style={{
        padding: "1.5rem",
        background: "var(--a-surface, #f7f4ec)",
        border: "2px solid var(--a-accent, #ffcc00)",
        borderRadius: "var(--a-r-sharp, 4px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.25rem" }}>📞</span>
        <h2 className="a-h2" style={{ fontSize: "1.125rem", margin: 0, color: "var(--a-text, #17140e)" }}>
          Klant gesproken? Afgesproken moment vastleggen
        </h2>
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--a-text-2, rgba(23,20,14,0.65))", margin: "0 0 1.25rem 0" }}>
        Selecteer hieronder de definitief afgesproken datum, het gewenste tijdslot en het aantal personen.
      </p>

      <form
        action={saveAndConfirmReservation.bind(null, reservationId)}
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {/* Custom Stylized Date Picker */}
          <div style={{ position: "relative" }} ref={calendarRef}>
            <label className="a-label" style={{ display: "block", marginBottom: "0.375rem", fontWeight: 600 }}>
              📅 Afgesproken Datum
            </label>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="a-input"
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                background: "var(--a-surface-2, #e7e0d0)",
                border: isCalendarOpen ? "2px solid var(--a-accent, #ffcc00)" : "1px solid var(--a-border)",
                textAlign: "left",
                fontWeight: 600,
                color: "var(--a-text, #17140e)",
              }}
            >
              <span>{formatDutchDate(selectedDate)}</span>
              <span style={{ opacity: 0.6 }}>🗓️</span>
            </button>
            <input type="hidden" name="requestedDate" value={selectedDate} />

            {/* Calendar Popover */}
            {isCalendarOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "105%",
                  left: 0,
                  zIndex: 100,
                  background: "var(--a-surface, #f7f4ec)",
                  border: "1px solid var(--a-border-strong, rgba(23,20,14,0.3))",
                  borderRadius: "6px",
                  padding: "1rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                  minWidth: "280px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <button
                    type="button"
                    className="a-btn a-btn--secondary"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  >
                    ←
                  </button>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "capitalize" }}>
                    {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                  </span>
                  <button
                    type="button"
                    className="a-btn a-btn--secondary"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  >
                    →
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center", marginBottom: "4px" }}>
                  {WEEKDAYS.map((w) => (
                    <span key={w} style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--a-text-2)", padding: "2px" }}>
                      {w}
                    </span>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
                  {cells.map((cell, idx) => {
                    if (!cell) return <span key={idx} />;
                    const iso = toIsoDate(cell);
                    const isSelected = iso === selectedDate;
                    const dayNum = cell.getDay();
                    const isOpen = dayNum === 4 || dayNum === 5 || dayNum === 6;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDateChange(iso)}
                        style={{
                          padding: "0.375rem 0",
                          fontSize: "0.75rem",
                          fontWeight: isSelected ? 700 : (isOpen ? 600 : 400),
                          background: isSelected ? "var(--a-accent, #ffcc00)" : (isOpen ? "rgba(255,204,0,0.12)" : "transparent"),
                          color: isSelected ? "var(--a-accent-contrast, #17140e)" : "var(--a-text)",
                          border: isSelected ? "1px solid var(--a-accent)" : "1px solid transparent",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        {cell.getDate()}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", borderTop: "1px solid var(--a-border)", paddingTop: "0.5rem" }}>
                  <button
                    type="button"
                    className="a-btn a-btn--secondary"
                    style={{ flex: 1, fontSize: "0.6875rem", padding: "0.25rem" }}
                    onClick={() => handleDateChange(toIsoDate(today))}
                  >
                    Vandaag
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn--secondary"
                    style={{ flex: 1, fontSize: "0.6875rem", padding: "0.25rem" }}
                    onClick={() => {
                      const nextSat = new Date();
                      nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7 || 7));
                      handleDateChange(toIsoDate(nextSat));
                    }}
                  >
                    Eerstvolgende Za
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Day-Configured Time Slot Picker (70 min fixed tours) */}
          <div>
            <label className="a-label" htmlFor="preferredPeriod" style={{ display: "block", marginBottom: "0.375rem", fontWeight: 600 }}>
              ⏰ Afgesproken Tijdslot ({formatDutchDate(selectedDate).split(" ")[0]})
            </label>
            <select
              id="preferredPeriod"
              name="preferredPeriod"
              className="a-input a-select"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              style={{ width: "100%", padding: "0.625rem 0.875rem", fontWeight: 500 }}
            >
              {daySlots.map((slot) => (
                <option key={slot.key} value={slot.label}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {/* Stylized Numberpicker (Without native spinners) */}
          <div>
            <label className="a-label" htmlFor="partySize" style={{ display: "block", marginBottom: "0.375rem", fontWeight: 600 }}>
              👥 Aantal personen
            </label>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "var(--a-surface-2, #e7e0d0)",
                border: "1px solid var(--a-border)",
                borderRadius: "var(--a-r-sharp, 4px)",
                padding: "3px",
              }}
            >
              <button
                type="button"
                className="a-btn a-btn--secondary"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  fontSize: "1.25rem",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--a-r-sharp, 4px)",
                  background: "var(--a-surface, #f7f4ec)",
                  cursor: partySize <= 1 ? "not-allowed" : "pointer",
                }}
                disabled={partySize <= 1}
                onClick={() => setPartySize((p) => Math.max(1, p - 1))}
              >
                −
              </button>
              <input
                id="partySize"
                name="partySize"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={partySize}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  if (cleaned === "") {
                    setPartySize(1);
                  } else {
                    const num = parseInt(cleaned, 10);
                    setPartySize(Math.min(250, Math.max(1, num)));
                  }
                }}
                className="a-input"
                style={{
                  width: "4.5rem",
                  height: "2.5rem",
                  border: "none",
                  background: "transparent",
                  textAlign: "center",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--a-text, #17140e)",
                  padding: 0,
                  outline: "none",
                  boxShadow: "none",
                }}
              />
              <button
                type="button"
                className="a-btn a-btn--secondary"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  fontSize: "1.25rem",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--a-r-sharp, 4px)",
                  background: "var(--a-surface, #f7f4ec)",
                  cursor: "pointer",
                }}
                onClick={() => setPartySize((p) => Math.min(250, p + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="a-label" htmlFor="notes" style={{ display: "block", marginBottom: "0.375rem", fontWeight: 600 }}>
            📝 Aangepaste notities / Dieetwensen / Afspraken
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="a-input"
            style={{ width: "100%", padding: "0.625rem 0.875rem", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="submit"
            className="a-btn a-btn--primary"
            style={{ padding: "0.65rem 1.5rem", fontWeight: 700, fontSize: "0.9375rem" }}
          >
            ✅ Opslaan &amp; Definitieve Bevestiging naar klant sturen
          </button>
        </div>
      </form>
    </div>
  );
}
