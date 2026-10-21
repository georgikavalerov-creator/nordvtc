-- Interface d'administration : guide (articles), indisponibilités, notes de réservation.
create table if not exists public.site_posts (
  slug text primary key check (slug ~ '^[a-z0-9-]{3,80}$'),
  title text not null,
  description text not null,
  tag text not null default 'Conseils',
  minutes int not null default 3,
  published_on date not null default current_date,
  published boolean not null default true,
  body jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
alter table public.site_posts enable row level security;

create table if not exists public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists blocked_periods_range_idx on public.blocked_periods (start_at, end_at);
alter table public.blocked_periods enable row level security;

alter table public.bookings
  add column if not exists admin_note text,
  add column if not exists driver text;
