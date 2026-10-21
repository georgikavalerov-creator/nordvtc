-- Comptes chauffeurs externes : chacun génère ses bons de commande avec SES mentions légales.
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  active boolean not null default true,
  name text not null,
  email text not null unique,
  password_hash text not null,
  phone text,
  company text,            -- raison sociale / nom de l'entreprise
  legal_form text,         -- ex. Entreprise individuelle (micro-entrepreneur)
  siret text,
  address text,
  registre text,           -- n° d'inscription au registre des exploitants VTC (EVTC…)
  carte_vtc text,
  vehicule text,
  plaque text,
  insurer text,
  vat_note text default 'TVA non applicable, art. 293 B du CGI',
  last_login_at timestamptz
);
alter table public.drivers enable row level security;
alter table public.bookings add column if not exists driver_id uuid references public.drivers(id) on delete set null;
create index if not exists bookings_driver_idx on public.bookings (driver_id) where driver_id is not null;
