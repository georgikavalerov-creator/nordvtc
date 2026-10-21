-- Codes promo + annulation en un clic.
create table if not exists public.promo_codes (
  code text primary key check (code = upper(code)),
  kind text not null check (kind in ('percent', 'amount')),
  value int not null check (value > 0),           -- % (1-100) ou centimes
  active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses int,                                   -- null = illimité
  max_uses_per_customer int not null default 1,
  min_price_cents int not null default 0,
  first_booking_only boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);
alter table public.promo_codes enable row level security;
alter table public.bookings
  add column if not exists promo_code text,
  add column if not exists discount_cents int not null default 0,
  add column if not exists cancelled_at timestamptz,
  add column if not exists refunded_cents int not null default 0;
create index if not exists bookings_promo_idx on public.bookings (promo_code) where promo_code is not null;
