import {supabase} from './client';
import type {CategoryBudgets} from '../types';
import {spendingCategories} from '../lib/spending';

export interface PremiumBudgetConfig {
  weeklyBudget:number;
  categoryBudgets:CategoryBudgets;
}

/** An empty entitlement is Free. Users cannot change this read-only table. */
export async function hasPremiumEntitlement(userId:string):Promise<boolean> {
  if(!supabase)return false;
  const {data,error}=await supabase.from('premium_entitlements')
    .select('plan,subscription_status,current_period_end').eq('user_id',userId).maybeSingle();
  if(error)throw error;
  return data?.plan==='premium' &&
    (data.subscription_status==='active'||data.subscription_status==='trialing') &&
    typeof data.current_period_end==='string' && Date.parse(data.current_period_end)>Date.now();
}
const capped=(value:unknown)=> {
  const n=Number(value);
  return Number.isFinite(n)?Math.max(0,Math.min(1e8,Math.round(n*100)/100)):0;
};
export async function loadPremiumBudgets(userId:string):Promise<PremiumBudgetConfig>{
  if(!supabase)throw new Error('Account access is not configured.');
  const {data,error}=await supabase.from('premium_budgets')
    .select('weekly_limit,category_limits').eq('user_id',userId).maybeSingle();
  if(error)throw error;
  const categoryBudgets:CategoryBudgets={};
  const limits=(data?.category_limits??{}) as Record<string,unknown>;
  for(const category of spendingCategories){const n=capped(limits[category]);if(n>0)categoryBudgets[category]=n;}
  return {weeklyBudget:capped(data?.weekly_limit),categoryBudgets};
}
export async function savePremiumBudgets(userId:string,config:PremiumBudgetConfig):Promise<void>{
  if(!supabase)throw new Error('Account access is not configured.');
  const category_limits:Record<string,number>={};
  for(const category of spendingCategories){const n=capped(config.categoryBudgets[category]);if(n>0)category_limits[category]=n;}
  const {error}=await supabase.from('premium_budgets').upsert({
    user_id:userId,weekly_limit:capped(config.weeklyBudget),category_limits,updated_at:new Date().toISOString()
  },{onConflict:'user_id'});
  if(error)throw error;
}
