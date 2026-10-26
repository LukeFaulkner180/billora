import type { Bill, Category, Debt, FinanceData, Frequency, Income } from '../types';
import {categories, dueOnOrAfter, formatDate, frequencies, makeId, round, today, validDate} from './money';

const KEY = 'billora_mvp_v2';
const OLD_KEY = 'billora_mvp_v1';
const newBill = (name: string, amount: number, day: number, category: Category): Bill => ({id: makeId(), name, amount, nextDue: dueOnOrAfter(day), anchorDay: day, frequency: 'monthly', category, payments: []});
const newDebt = (name: string, balance: number, originalBalance: number, apr: number, minPayment: number, promoEnd = ''): Debt => ({id: makeId(), name, balance, originalBalance, apr, minPayment, promoEnd, payments: []});
export function emptyData(): FinanceData {
  return {version:2,mode:'personal',incomes:[],bills:[],debts:[],settings:{strategy:'avalanche',extraPayment:0}};
}
export function demoData(): FinanceData {
  return {
    version: 2, mode: 'demo',
    incomes: [
      {id: makeId(), name: 'Main salary', amount: 2850, frequency: 'monthly'},
      {id: makeId(), name: 'Second income', amount: 420, frequency: 'fourweekly'},
    ],
    bills: [
      newBill('Rent', 895, 1, 'Home'), newBill('Energy', 135, 7, 'Utilities'),
      newBill('Council tax', 165, 12, 'Home'), newBill('Broadband', 34, 17, 'Utilities'),
      newBill('Mobile phone', 29, 20, 'Subscriptions'), newBill('Car insurance', 58, 25, 'Insurance'),
      newBill('Streaming service', 12.99, 4, 'Subscriptions'),
    ],
    debts: [
      newDebt('Credit card', 1900, 3200, 24.9, 90), newDebt('Car loan', 5600, 9200, 7.9, 155),
      newDebt('0% credit card', 1250, 2300, 21.9, 50, '2027-06-01'),
    ],
    settings: {strategy: 'avalanche', extraPayment: 100},
  };
}
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (v: unknown) => String(v ?? '').trim().slice(0, 100);
const money = (v: unknown) => Math.min(1e10, Math.max(0, round(Number(v) || 0)));
const percentage = (v: unknown) => Math.min(100, Math.max(0, Number(v) || 0));
const frequency = (v: unknown): Frequency => typeof v === 'string' && v in frequencies ? v as Frequency : 'monthly';
const safeDate = (v: unknown, fallback: string) => validDate(v) ? v : fallback;

/** Validates saved or imported data, including backups created by the previous HTML demo. */
export function normaliseData(payload: unknown): FinanceData {
  const data = object(payload);
  if (!Array.isArray(data.incomes) || !Array.isArray(data.bills) || !Array.isArray(data.debts)) throw new Error('This file is not a valid Billora backup.');
  const incomes: Income[] = data.incomes.slice(0, 500).map((value: unknown) => {
    const item = object(value); return {id: text(item.id) || makeId(), name: text(item.name) || 'Income', amount: money(item.amount), frequency: frequency(item.frequency)};
  });
  const bills: Bill[] = data.bills.slice(0, 1000).map((value: unknown) => {
    const item = object(value); const nextDue = safeDate(item.nextDue, today());
    const cat = categories.includes(item.category as Category) ? item.category as Category : 'Other';
    const payments = Array.isArray(item.payments) ? item.payments.slice(-100).map((value: unknown) => {
      const p = object(value); return {date: safeDate(p.date, today()), amount: money(p.amount), due: safeDate(p.due, nextDue)};
    }).filter(p => p.amount > 0) : [];
    return {id: text(item.id) || makeId(), name: text(item.name) || 'Bill', amount: money(item.amount), frequency: frequency(item.frequency), category: cat, nextDue, anchorDay: Math.min(31, Math.max(1, Number(item.anchorDay) || Number(nextDue.slice(8)))), payments};
  });
  const debts: Debt[] = data.debts.slice(0, 500).map((value: unknown) => {
    const item = object(value); const balance = money(item.balance);
    const payments = Array.isArray(item.payments) ? item.payments.slice(-100).map((value: unknown) => {
      const p = object(value); return {date: safeDate(p.date, today()), amount: money(p.amount)};
    }).filter(p => p.amount > 0) : [];
    return {id: text(item.id) || makeId(), name: text(item.name) || 'Debt', balance, originalBalance: Math.max(balance, money(item.originalBalance)), apr: percentage(item.apr), minPayment: money(item.minPayment), promoEnd: validDate(item.promoEnd) ? item.promoEnd : '', payments};
  });
  const settings = object(data.settings);
  return {version: 2, mode: data.mode === 'demo' ? 'demo' : 'personal', incomes, bills, debts, settings: {strategy: settings.strategy === 'snowball' ? 'snowball' : 'avalanche', extraPayment: Math.min(1e6, money(settings.extraPayment))}};
}
export function initialData(): FinanceData {
  try {
    const saved = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
    return saved ? normaliseData(JSON.parse(saved)) : demoData();
  } catch { return demoData(); }
}
export function saveData(data: FinanceData): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
  catch { return false; }
}
export function exportData(data: FinanceData) {
  const blob = new Blob([JSON.stringify({...data, exportedAt: formatDate(new Date())}, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `billora-backup-${today()}.json`;
  link.click(); URL.revokeObjectURL(url);
}
