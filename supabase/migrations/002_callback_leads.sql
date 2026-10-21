create table if not exists public.callback_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  need text,
  verified boolean not null default false,
  ip_hash text
);
create index if not exists callback_leads_created_idx on public.callback_leads (created_at desc);
alter table public.callback_leads enable row level security;
