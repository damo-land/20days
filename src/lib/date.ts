/** Local-day date helpers. ISO form is `yyyy-mm-dd` in the device's local timezone. */

export function todayISO(from: Date = new Date()): string {
  const y = from.getFullYear();
  const m = String(from.getMonth() + 1).padStart(2, '0');
  const d = String(from.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isoDaysAgo(n: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return todayISO(d);
}

/** Ordered list of the last `days` local dates ending at `endISO` (inclusive), oldest first. */
export function lastNDates(days: number, endISO: string = todayISO()): string[] {
  const end = new Date(`${endISO}T00:00:00`);
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(todayISO(d));
  }
  return out;
}
