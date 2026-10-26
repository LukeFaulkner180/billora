/** The shared shape of a user's personal-finance data. No bank credentials are stored. */
export type Frequency = 'weekly' | 'fourweekly' | 'monthly' | 'quarterly' | 'yearly';
export type Category = 'Home' | 'Utilities' | 'Subscriptions' | 'Insurance' | 'Transport' | 'Other';
export type Strategy = 'snowball' | 'avalanche';
export type Page = 'overview' | 'budget' | 'bills' | 'debts' | 'planner' | 'settings';
export type SpendingCategory = 'Groceries' | 'Eating out' | 'Transport' | 'Shopping' | 'Entertainment' | 'Health' | 'Other';
export type SpendingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export interface SpendingEntry {id:string;name:string;amount:number;date:string;category:SpendingCategory;source:'manual'|'receipt'}
export interface SavingsGoal {id:string;name:string;target:number;saved:number;targetDate:string}

export interface BillPayment { date: string; amount: number; due: string }
export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: Category;
  frequency: Frequency;
  nextDue: string;
  anchorDay: number;
  payments: BillPayment[];
}
export interface DebtPayment { date: string; amount: number }
export interface Debt {
  id: string;
  name: string;
  balance: number;
  originalBalance: number;
  apr: number;
  minPayment: number;
  promoEnd: string;
  payments: DebtPayment[];
}
export interface Income { id: string; name: string; amount: number; frequency: Frequency }
export interface FinanceData {
  version: 2;
  mode: 'demo' | 'personal';
  incomes: Income[];
  bills: Bill[];
  debts: Debt[];
  spending: SpendingEntry[];
  savingsGoals: SavingsGoal[];
  settings: { strategy: Strategy; extraPayment: number; weeklyBudget: number };
}
