import { HttpsError } from 'firebase-functions/v2/https';

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Client-supplied user calendar day (YYYY-MM-DD). Not inferred from server UTC. */
export function parseDailyConversationLocalDate(value: unknown): string {
  if (typeof value !== 'string' || !LOCAL_DATE.test(value)) {
    throw new HttpsError(
      'invalid-argument',
      'localDate must be a YYYY-MM-DD calendar date.',
    );
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== (month ?? 1) - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new HttpsError(
      'invalid-argument',
      'localDate must be a YYYY-MM-DD calendar date.',
    );
  }

  const utcToday = new Date();
  const utcIso = `${utcToday.getUTCFullYear()}-${String(utcToday.getUTCMonth() + 1).padStart(2, '0')}-${String(utcToday.getUTCDate()).padStart(2, '0')}`;
  const drift = Math.abs(isoDayNumber(value) - isoDayNumber(utcIso));
  if (drift > 2) {
    throw new HttpsError(
      'invalid-argument',
      'localDate is too far from the current day.',
    );
  }

  return value;
}

function isoDayNumber(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) / 86_400_000;
}
