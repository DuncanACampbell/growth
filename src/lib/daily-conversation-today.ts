import { getLocalIsoDate } from '@/lib/calendar';

let cachedDate: string | null = null;
let cachedThought: string | null = null;

export function rememberTodaysDailyConversationThought(
  localDate: string,
  thought: string,
): void {
  const trimmed = thought.trim();
  if (!trimmed) {
    return;
  }
  cachedDate = localDate;
  cachedThought = trimmed;
}

export function peekTodaysDailyConversationThought(
  localDate: string = getLocalIsoDate(),
): string | null {
  if (cachedDate !== localDate) {
    return null;
  }
  return cachedThought;
}
