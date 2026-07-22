// components/tastings-date-field.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { TOURS_TASTINGS_COPY as C } from "@/lib/content/tours-tastings";

const WEEKDAYS: Record<"nl" | "en", string[]> = {
  nl: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Calendar grid runs Monday-first; getDay() is Sunday-first (0-6), so shift it.
function mondayFirstIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function buildMonthGrid(viewMonth: Date): (Date | null)[] {
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const leadingBlanks = mondayFirstIndex(firstOfMonth);

  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

// Only Thursday (4), Friday (5), and Saturday (6) are open for bookings
function isOpenDay(date: Date): boolean {
  const day = date.getDay();
  return day === 4 || day === 5 || day === 6;
}

export function DateField() {
  const { t, lang } = useLanguage();
  const today = startOfDay(new Date());

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const monthLabel = viewMonth.toLocaleDateString(lang === "nl" ? "nl-NL" : "en-US", {
    month: "long",
    year: "numeric",
  });
  const displayValue = selected
    ? selected.toLocaleDateString(lang === "nl" ? "nl-NL" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const cells = buildMonthGrid(viewMonth);

  return (
    <div className="tastings-field tastings-field-date" ref={wrapRef}>
      <label htmlFor="requestedDate-trigger">
        <span className="fn">02</span>
        <span className="fl">{t(C.fieldDate.nl, C.fieldDate.en)}</span>
      </label>
      <button
        type="button"
        id="requestedDate-trigger"
        className="tastings-input tastings-date-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={selected ? "" : "tastings-date-placeholder"}>
          {displayValue || t(C.datePlaceholder.nl, C.datePlaceholder.en)}
        </span>
      </button>
      <input type="hidden" name="requestedDate" value={selected ? toIsoDate(selected) : ""} />

      {open ? (
        <div className="tastings-calendar" role="dialog" aria-label={t(C.fieldDate.nl, C.fieldDate.en)}>
          <div className="tastings-calendar-head">
            <button
              type="button"
              className="tastings-calendar-nav"
              aria-label={t(C.datePrevMonth.nl, C.datePrevMonth.en)}
              onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              ←
            </button>
            <span className="tastings-calendar-month">{monthLabel}</span>
            <button
              type="button"
              className="tastings-calendar-nav"
              aria-label={t(C.dateNextMonth.nl, C.dateNextMonth.en)}
              onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              →
            </button>
          </div>
          <div className="tastings-calendar-weekdays">
            {WEEKDAYS[lang].map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="tastings-calendar-grid">
            {cells.map((cell, index) => {
              if (!cell) return <span key={index} />;
              const disabled = cell < today || !isOpenDay(cell);
              const isSelected = selected ? toIsoDate(selected) === toIsoDate(cell) : false;
              const isToday = toIsoDate(cell) === toIsoDate(today);
              return (
                <button
                  key={index}
                  type="button"
                  disabled={disabled}
                  className={`tastings-calendar-day${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}`}
                  onClick={() => {
                    setSelected(cell);
                    setOpen(false);
                  }}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="tastings-calendar-today"
            onClick={() => {
              setSelected(today);
              setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              setOpen(false);
            }}
          >
            {t(C.dateToday.nl, C.dateToday.en)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
