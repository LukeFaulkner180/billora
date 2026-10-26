-- Billora ONLY: subscription access and premium-only spending limits.
-- Schema recorded for reproducibility. Already applied to Billora's separate
-- project gqzwtxiltlguqkactgmh. Do NOT run on DayRidge.
-- To provision a fresh database, apply once after 001_finance_snapshots.sql.
-- Only trusted Stripe webhook/server code may assign entitlement rows.
create table if not exists public.premium_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','premium')),
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive','trialing','active','past_due','canceled')),
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.premium_entitlements enable row level security;
revoke all on public.premium_entitlements from anon, authenticated;
grant select on public.premium_entitlements to authenticated;
create policy "User reads only own premium entitlement"
on public.premium_entitlements
for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.premium_budgets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekly_limit numeric not null default 0 check (weekly_limit >= 0 and weekly_limit <= 100000000),
  category_limits jsonb not null default '{}'::jsonb check (jsonb_typeof(category_limits) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.premium_budgets enable row level security;
revoke all on public.premium_budgets from anon;
grant select, insert, update on public.premium_budgets to authenticated;
-- The authenticated role can only access its own row if the database
-- confirms an active or trialing unexpired premium subscription.
create policy "Paid users read only their premium budgets"
on public.premium_budgets for select to authenticated
using (
  user_id=(select auth.uid()) AND EXISTS (
    SELECT 1 FROM public.premium_entitlements e WHERE
    e.user_id=(select auth.uid()) AND e.plan='premium'
    AND e.subscription_status IN ('active','trialing')
    AND e.current_period_end > now()
  )
);
create policy "Paid users create only their premium budgets"
on public.premium_budgets for insert to authenticated
with check (
  user_id=(select auth.uid()) AND EXISTS (
    SELECT 1 FROM public.premium_entitlements e WHERE
    e.user_id=(select auth.uid()) AND e.plan='premium'
    AND e.subscription_status IN ('active','trialing')
    AND e.current_period_end > now()
  )
);
create policy "Paid users update only their premium budgets"
on public.premium_budgets for update to authenticated
using (
  user_id=(select auth.uid()) AND EXISTS (
    SELECT 1 FROM public.premium_entitlements e WHERE
    e.user_id=(select auth.uid()) AND e.plan='premium'
    AND e.subscription_status IN ('active','trialing')
    AND e.current_period_end > now()
  )
)
with check (
  user_id=(select auth.uid()) AND EXISTS (
    SELECT 1 FROM public.premium_entitlements e WHERE
    e.user_id=(select auth.uid()) AND e.plan='premium'
    AND e.subscription_status IN ('active','trialing')
    AND e.current_period_end > now()
  )
);
