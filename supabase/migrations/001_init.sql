-- Nord VTC : tables de réservation et de réglages.
-- À appliquer dans le projet Supabase choisi pour ce site.
-- RLS activée SANS politique publique : seules les routes serveur (clé service_role) y accèdent.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'completed', 'cancelled', 'expired')),
  origin_label text not null,
  origin_lat double precision not null,
  origin_lng double precision not null,
  dest_label text not null,
  dest_lat double precision not null,
  dest_lng double precision not null,
  pickup_at timestamptz not null,
  passengers int not null check (passengers between 1 and 8),
  luggage int not null default 0,
  child_seat boolean not null default false,
  flight text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  notes text,
  distance_m int not null,
  duration_s int not null,
  price_cents int not null,
  charge_cents int not null,
  pay_mode text not null check (pay_mode in ('deposit', 'full')),
  paid_cents int not null default 0,
  paid_at timestamptz,
  stripe_session_id text,
  stripe_payment_intent text
);

create index if not exists bookings_pickup_idx on public.bookings (pickup_at);
create index if not exists bookings_status_idx on public.bookings (status);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
alter table public.settings enable row level security;
