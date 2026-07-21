// lib/format-date.ts

// Reservation/block dates are stored as plain "YYYY-MM-DD" strings with no
// time component. Parsing them with `new Date(isoString)` reads them as UTC
// midnight, which can shift a day off in a non-UTC runtime — parse the parts
// explicitly and build a local date instead.
function parseIsoDate(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

// "maandag 20 juli 2026"
export function formatAdminDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
