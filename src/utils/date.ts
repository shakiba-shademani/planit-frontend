export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function shiftISODate(value: string, days: number): string {
  const next = parseISODate(value);
  next.setDate(next.getDate() + days);
  return toISODate(next);
}

export function compareISODate(a: string, b: string): number {
  return a.localeCompare(b);
}

export function isBeforeToday(value: string): boolean {
  return compareISODate(value, todayISO()) < 0;
}

/** Monday as first day of week (local). */
export function startOfWeek(value: string): string {
  const date = parseISODate(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return toISODate(date);
}

export function endOfWeek(value: string): string {
  return shiftISODate(startOfWeek(value), 6);
}

export function startOfMonth(value: string): string {
  const date = parseISODate(value);
  date.setDate(1);
  return toISODate(date);
}

export function endOfMonth(value: string): string {
  const date = parseISODate(value);
  date.setMonth(date.getMonth() + 1, 0);
  return toISODate(date);
}

export function eachDay(from: string, to: string): string[] {
  if (compareISODate(from, to) > 0) return [];

  const days: string[] = [];
  let cursor = from;

  while (compareISODate(cursor, to) <= 0) {
    days.push(cursor);
    cursor = shiftISODate(cursor, 1);
  }

  return days;
}

export function weekDays(value: string): string[] {
  return eachDay(startOfWeek(value), endOfWeek(value));
}

export function formatLongDate(value: string): string {
  return parseISODate(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortWeekday(value: string): string {
  return parseISODate(value).toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatMonthYear(value: string): string {
  return parseISODate(value).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatDayNumber(value: string): string {
  return String(parseISODate(value).getDate());
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
