-- Espace personnel complet : profil, adresses enregistrées, avis sur les trajets.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  default_passengers int not null default 1 check (default_passengers between 1 and 4),
  default_child_seat boolean not null default false,
  marketing_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'other' check (kind in ('home', 'work', 'other')),
  label text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);
create index if not exists saved_places_user_idx on public.saved_places (user_id);
create table if not exists public.trip_ratings (
  booking_id uuid primary key references public.bookings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.saved_places enable row level security;
alter table public.trip_ratings enable row level security;
