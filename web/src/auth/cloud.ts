import type {FinanceData} from '../types';
import {supabase} from './client';
import {normaliseData} from '../lib/storage';
import {emptyData} from '../lib/storage';

/** Single-user finance snapshot protected by PostgreSQL RLS.
 * A missing row is a NEW empty account, never seeded with sample demo finances. */
export async function loadCloudData(userId: string): Promise<FinanceData> {
  if(!supabase) throw new Error('Accounts are not configured.');
  const {data,error}=await supabase.from('finance_snapshots').select('data').eq('user_id',userId).maybeSingle();
  if(error) throw error;
  return data ? {...normaliseData(data.data),mode:'personal'} : emptyData();
}
export async function saveCloudData(userId: string, data: FinanceData): Promise<void> {
  if(!supabase) throw new Error('Accounts are not configured.');
  if(data.mode==='demo') throw new Error('Sample data cannot be uploaded to an account.');
  // Premium-only budgets are persisted separately in the RLS-protected premium_budgets table.
  const sanitized={...data,categoryBudgets:{},settings:{...data.settings,weeklyBudget:0}};
  const {error}=await supabase.from('finance_snapshots').upsert({user_id:userId,data:sanitized,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error) throw error;
}
