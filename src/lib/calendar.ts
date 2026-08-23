import type { IsoDate } from '@/types/models';

/** Local-calendar YYYY-MM-DD. Not a rolling 24-hour window. */
export function getLocalIsoDate(now: Date = new Date()): IsoDate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromIso(iso: IsoDate): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

export function addCalendarDays(iso: IsoDate, days: number): IsoDate {
  const date = dateFromIso(iso);
  date.setDate(date.getDate() + days);
  return getLocalIsoDate(date);
}

export function compareIsoDates(left: IsoDate, right: IsoDate): number {
  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}

export function isSameIsoDate(left: IsoDate, right: IsoDate): boolean {
  return left === right;
}

export function isIsoDateOnOrBefore(left: IsoDate, right: IsoDate): boolean {
  return compareIsoDates(left, right) <= 0;
}
