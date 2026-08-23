// lib/email/calendar.ts
import type { Reservation } from "@/lib/db/reservations";

export interface ParsedEventTimes {
  start: Date;
  end: Date;
}

export function parseReservationTimes(reservation: Reservation): ParsedEventTimes {
  const dateStr = reservation.requestedDate || new Date().toISOString().split("T")[0];
  let startHour = 15;
  let startMinute = 0;
  let durationHours = 2;

  const period = (reservation.preferredPeriod || "").toLowerCase();

  // Try matching HH:MM (e.g. "14:00" or "15:30")
  const timeMatch = period.match(/(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    startHour = parseInt(timeMatch[1], 10);
    startMinute = parseInt(timeMatch[2], 10);
  } else if (period.includes("ochtend") || period.includes("morning")) {
    startHour = 11;
  } else if (period.includes("middag") || period.includes("afternoon")) {
    startHour = 15;
  } else if (period.includes("avond") || period.includes("evening")) {
    startHour = 18;
    durationHours = 3;
  }

  // If track is zakelijk, default to 3 hours
  if (reservation.track === "zakelijk") {
    durationHours = 3;
  }

  const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));
  const start = new Date(year, month - 1, day, startHour, startMinute, 0);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  return { start, end };
}

function formatDateToIcs(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateGoogleCalendarUrl(reservation: Reservation): string {
  const { start, end } = parseReservationTimes(reservation);
  const title = reservation.track === "zakelijk"
    ? `Chateau Amsterdam · Zakelijk Event (${reservation.companyName || reservation.contactName})`
    : `Chateau Amsterdam · Tasting & Tour (${reservation.contactName})`;

  const details = [
    `Reservering bij Chateau Amsterdam`,
    `Gezelschap: ${reservation.partySize || reservation.groupSize || "2"} personen`,
    `Contact: ${reservation.contactName} (${reservation.email})`,
    reservation.phone ? `Telefoon: ${reservation.phone}` : null,
    reservation.occasion ? `Gelegenheid: ${reservation.occasion}` : null,
    reservation.notes ? `Opmerkingen: "${reservation.notes}"` : null,
    ``,
    `Locatie: Chateau Amsterdam (Johan van Hasseltweg 51, 1021 KN Amsterdam)`,
    `10 min. vanaf Amsterdam Centraal · Gratis parkeren`,
    `Vragen? Mail naar sales@chateau.amsterdam of winery@chateau.amsterdam`,
  ].filter(Boolean).join("\n");

  const startIso = formatDateToIcs(start);
  const endIso = formatDateToIcs(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startIso}/${endIso}`,
    details: details,
    location: "Johan van Hasseltweg 51, 1021 KN Amsterdam, Nederland",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent(reservation: Reservation): string {
  const { start, end } = parseReservationTimes(reservation);
  const title = reservation.track === "zakelijk"
    ? `Chateau Amsterdam - Zakelijk Event (${reservation.companyName || reservation.contactName})`
    : `Chateau Amsterdam - Tasting & Tour (${reservation.contactName})`;

  const description = [
    `Reservering bij Chateau Amsterdam`,
    `Gezelschap: ${reservation.partySize || reservation.groupSize || "2"} personen`,
    `Contact: ${reservation.contactName}`,
    reservation.phone ? `Telefoon: ${reservation.phone}` : "",
    reservation.occasion ? `Gelegenheid: ${reservation.occasion}` : "",
    reservation.notes ? `Opmerkingen: ${reservation.notes}` : "",
    `Locatie: Johan van Hasseltweg 51, 1021 KN Amsterdam`,
  ].filter(Boolean).join("\\n");

  const uid = `res-${reservation.id || Date.now()}@chateau.amsterdam`;
  const dtStamp = formatDateToIcs(new Date());
  const dtStart = formatDateToIcs(start);
  const dtEnd = formatDateToIcs(end);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chateau Amsterdam//Winery Reservations//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "LOCATION:Johan van Hasseltweg 51\\, 1021 KN Amsterdam\\, Nederland",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Herinnering: Je bezoek aan Chateau Amsterdam",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
