create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'HomeReady AI conversation',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  deleted_at timestamptz,
  retention_until timestamptz not null default now() + interval '180 days'
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  kind text not null default 'General',
  size_bytes bigint not null default 0,
  extracted_text text not null,
  redaction_warnings text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  deleted_at timestamptz,
  retention_until timestamptz not null default now() + interval '90 days'
);

create table if not exists public.checklist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index if not exists conversations_user_active_idx
on public.conversations (user_id, updated_at desc)
where deleted_at is null;

create index if not exists documents_user_active_idx
on public.documents (user_id, created_at desc)
where deleted_at is null;

alter table public.conversations enable row level security;
alter table public.documents enable row level security;
alter table public.checklist_items enable row level security;

drop policy if exists "Users can read active conversations" on public.conversations;
create policy "Users can read active conversations"
on public.conversations
for select
using (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Users can insert conversations" on public.conversations;
create policy "Users can insert conversations"
on public.conversations
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their conversations" on public.conversations;
create policy "Users can update their conversations"
on public.conversations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read active documents" on public.documents;
create policy "Users can read active documents"
on public.documents
for select
using (auth.uid() = user_id and deleted_at is null);

drop policy if exists "Users can insert documents" on public.documents;
create policy "Users can insert documents"
on public.documents
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their documents" on public.documents;
create policy "Users can update their documents"
on public.documents
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their checklist" on public.checklist_items;
create policy "Users can manage their checklist"
on public.checklist_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversations_touch_updated_at on public.conversations;
create trigger conversations_touch_updated_at
before update on public.conversations
for each row execute function public.touch_updated_at();

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
before update on public.documents
for each row execute function public.touch_updated_at();

drop trigger if exists checklist_touch_updated_at on public.checklist_items;
create trigger checklist_touch_updated_at
before update on public.checklist_items
for each row execute function public.touch_updated_at();
