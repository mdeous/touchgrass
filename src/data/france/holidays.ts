import { addDays } from "date-fns";
import type { Holiday } from "@/engine/types";

function computeEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getMetropolitanHolidays(year: number): Holiday[] {
  const easter = computeEasterSunday(year);
  const easterMonday = addDays(easter, 1);
  const ascension = addDays(easter, 39);
  const whitMonday = addDays(easter, 50);

  return [
    {
      date: new Date(year, 0, 1),
      name: "Jour de l'An",
      nameEn: "New Year's Day",
    },
    { date: easterMonday, name: "Lundi de Pâques", nameEn: "Easter Monday" },
    {
      date: new Date(year, 4, 1),
      name: "Fête du Travail",
      nameEn: "Labour Day",
    },
    {
      date: new Date(year, 4, 8),
      name: "Victoire 1945",
      nameEn: "Victory in Europe Day",
    },
    { date: ascension, name: "Ascension", nameEn: "Ascension Thursday" },
    { date: whitMonday, name: "Lundi de Pentecôte", nameEn: "Whit Monday" },
    {
      date: new Date(year, 6, 14),
      name: "Fête Nationale",
      nameEn: "Bastille Day",
    },
    {
      date: new Date(year, 7, 15),
      name: "Assomption",
      nameEn: "Assumption of Mary",
    },
    {
      date: new Date(year, 10, 1),
      name: "Toussaint",
      nameEn: "All Saints' Day",
    },
    {
      date: new Date(year, 10, 11),
      name: "Armistice",
      nameEn: "Armistice Day",
    },
    { date: new Date(year, 11, 25), name: "Noël", nameEn: "Christmas Day" },
  ];
}

function getAlsaceMoselleExtras(year: number): Holiday[] {
  return [
    goodFriday(year),
    {
      date: new Date(year, 11, 26),
      name: "Saint-Étienne",
      nameEn: "St. Stephen's Day",
    },
  ];
}

function goodFriday(year: number): Holiday {
  return {
    date: addDays(computeEasterSunday(year), -2),
    name: "Vendredi Saint",
    nameEn: "Good Friday",
  };
}

// Good Friday is a public holiday in Guadeloupe and Martinique
// (date-holidays FR-GP / FR-MQ rules).
const DOM_TOM_HOLIDAYS: Record<string, (year: number) => Holiday[]> = {
  guadeloupe: (year) => [
    goodFriday(year),
    {
      date: new Date(year, 4, 27),
      name: "Abolition de l'esclavage",
      nameEn: "Abolition of Slavery",
    },
    {
      date: new Date(year, 6, 21),
      name: "Fête Victor Schœlcher",
      nameEn: "Victor Schoelcher Day",
    },
  ],
  martinique: (year) => [
    goodFriday(year),
    {
      date: new Date(year, 4, 22),
      name: "Abolition de l'esclavage",
      nameEn: "Abolition of Slavery",
    },
    {
      date: new Date(year, 6, 21),
      name: "Fête Victor Schœlcher",
      nameEn: "Victor Schoelcher Day",
    },
  ],
  guyane: (year) => [
    {
      date: new Date(year, 5, 10),
      name: "Abolition de l'esclavage",
      nameEn: "Abolition of Slavery",
    },
  ],
  reunion: (year) => [
    {
      date: new Date(year, 11, 20),
      name: "Abolition de l'esclavage",
      nameEn: "Abolition of Slavery",
    },
  ],
  mayotte: (year) => [
    {
      date: new Date(year, 3, 27),
      name: "Abolition de l'esclavage",
      nameEn: "Abolition of Slavery",
    },
  ],
};

export function getEasterSunday(year: number): Date {
  return computeEasterSunday(year);
}

export function getHolidaysForYear(year: number, region: string): Holiday[] {
  const base = getMetropolitanHolidays(year);

  if (region === "alsace-moselle") {
    return [...base, ...getAlsaceMoselleExtras(year)];
  }

  const domTomFn = Object.hasOwn(DOM_TOM_HOLIDAYS, region)
    ? DOM_TOM_HOLIDAYS[region]
    : undefined;
  if (domTomFn) {
    return [...base, ...domTomFn(year)];
  }

  return base;
}
