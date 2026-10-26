-- Run ONLY in a new dedicated Billora Supabase project; never in DayRidge.
-- Users' financial records are completely isolated by their auth.uid().
create table if not exists public.finance_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint finance_data_is_object check (jsonb_typeof(data) = 'object')
);
alter table public.finance_snapshots enable row level security;
revoke all on public.finance_snapshots from anon;
grant select, insert, update, delete on public.finance_snapshots to authenticated;

create policy "Read only own finances" on public.finance_snapshots
  for select to authenticated using ((select auth.uid())=user_id);
create policy "Create only own finances" on public.finance_snapshots
  for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update only own finances" on public.finance_snapshots
  for update to authenticated using ((select auth.uid())=user_id)
  with check ((select auth.uid())=user_id);
create policy "Delete only own finances" on public.finance_snapshots
  for delete to authenticated using ((select auth.uid())=user_id);
