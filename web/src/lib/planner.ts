import type {Debt, Strategy} from '../types';
import {addMonths, round, today, total} from './money';
export interface PlanPoint { month: number; balance: number }
export interface PlanResult { months: number | null; interest: number; paid: number; points: PlanPoint[]; payoff: Record<string, number>; valid: boolean }

/** Monthly amortisation estimate. The same repayment budget is retained as debts are cleared. */
export function planDebts(items: Debt[], extra: number, strategy: Strategy): PlanResult {
  const debts = items.filter(d => d.balance > .005).map(d => ({...d, balance: round(d.balance)}));
  const starting = total(debts.map(d => d.balance));
  const budget = round(total(debts.map(d => d.minPayment)) + Math.max(0, extra));
  const points: PlanPoint[] = [{month: 0, balance: starting}];
  const payoff: Record<string, number> = {};
  let interest = 0, paid = 0;
  if (starting === 0) return {months: 0, interest, paid, points, payoff, valid: true};
  if (budget <= 0) return {months: null, interest, paid, points, payoff, valid: false};
  for (let month = 1; month <= 600; month++) {
    const monthDate = addMonths(today(), month);
    let left = budget;
    for (const d of debts) {
      if (d.balance <= 0) continue;
      const rate = d.promoEnd && monthDate <= d.promoEnd ? 0 : d.apr;
      const fee = round(d.balance * rate / 1200);
      interest = round(interest + fee);
      d.balance = round(d.balance + fee);
    }
    // Contractual minimums are paid before the chosen accelerated-payoff strategy.
    for (const d of debts) {
      const payment = Math.min(d.balance, d.minPayment, left);
      d.balance = round(d.balance - payment);
      left = round(left - payment);
      paid = round(paid + payment);
      if (d.balance <= .005 && !payoff[d.id]) payoff[d.id] = month;
    }
    const currentApr = (d: Debt) => d.promoEnd && monthDate <= d.promoEnd ? 0 : d.apr;
    const ordered = [...debts].filter(d => d.balance > .005).sort((a, b) => strategy === 'snowball' ? (a.balance - b.balance) || (currentApr(b) - currentApr(a)) : (currentApr(b) - currentApr(a)) || (a.balance - b.balance));
    for (const d of ordered) {
      const payment = Math.min(d.balance, left);
      d.balance = round(d.balance - payment);
      left = round(left - payment);
      paid = round(paid + payment);
      if (d.balance <= .005 && !payoff[d.id]) payoff[d.id] = month;
    }
    const remaining = total(debts.map(d => d.balance));
    points.push({month, balance: remaining});
    if (remaining <= .005) return {months: month, interest, paid, points, payoff, valid: true};
  }
  return {months: null, interest, paid, points, payoff, valid: false};
}
export function payoffDate(months: number | null) {
  if (months === null) return 'Not projected';
  if (months === 0) return 'Debt-free!';
  return new Date(`${addMonths(today(), months)}T12:00:00`).toLocaleDateString('en-GB', {month: 'short', year: 'numeric'});
}
