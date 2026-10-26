import type { Bill, Frequency } from '../types';

export const frequencies: Record<Frequency, string> = {
  weekly: 'Weekly', fourweekly: 'Every 4 weeks', monthly: 'Monthly',
  quarterly: 'Quarterly', yearly: 'Yearly',
};
export const categories = ['Home', 'Utilities', 'Subscriptions', 'Insurance', 'Transport', 'Other'] as const;
export const categoryColours: Record<(typeof categories)[number], string> = {
  Home: '#6157f5', Utilities: '#46bea6', Subscriptions: '#f2a45d',
  Insurance: '#70a5f1', Transport: '#cf8edf', Other: '#a6b0c2',
};
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const pounds = (n: number) => new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP'}).format(n);
export const compactPounds = (n: number) => new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP', maximumFractionDigits: 0}).format(n);
export const monthly = (amount: number, frequency: Frequency) => round(amount * ({weekly: 52 / 12, fourweekly: 13 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12}[frequency]));
export const total = (values: number[]) => round(values.reduce((sum, n) => sum + n, 0));
export const today = () => formatDate(new Date());
export function formatDate(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function readDate(value: string): Date { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d, 12); }
export function validDate(s: unknown): s is string { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(readDate(s).getTime()) && formatDate(readDate(s)) === s; }
export function dateText(date: string) { return readDate(date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}); }
export function daysTo(date: string) {
  const t = readDate(today()); const d = readDate(date);
  return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())) / 86400000);
}
export function addMonths(date: string, count: number, anchorDay?: number) {
  const d = readDate(date);
  const target = new Date(d.getFullYear(), d.getMonth() + count, 1, 12);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(anchorDay ?? d.getDate(), lastDay));
  return formatDate(target);
}
export function advanceBill(bill: Bill) {
  if (bill.frequency === 'weekly' || bill.frequency === 'fourweekly') {
    const d = readDate(bill.nextDue);
    d.setDate(d.getDate() + (bill.frequency === 'weekly' ? 7 : 28));
    return formatDate(d);
  }
  return addMonths(bill.nextDue, {monthly: 1, quarterly: 3, yearly: 12}[bill.frequency], bill.anchorDay);
}
export function dueOnOrAfter(day: number) {
  let d = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  d = addMonths(d, 0, day);
  return d < today() ? addMonths(d, 1, day) : d;
}
export function dueStatus(nextDue: string) {
  const days = daysTo(nextDue);
  return days < 0 ? {text: 'Overdue', cls: 'overdue'} : days === 0 ? {text: 'Due today', cls: 'today'} : days <= 7 ? {text: 'Due soon', cls: 'soon'} : {text: 'Upcoming', cls: 'upcoming'};
}
export const makeId = () => crypto.randomUUID();
