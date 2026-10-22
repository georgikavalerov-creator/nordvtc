-- Clés d'accès (Face ID / Touch ID / empreinte / Windows Hello) pour l'administration et l'espace chauffeur.
-- Seule la clé PUBLIQUE est stockée : la donnée biométrique ne quitte jamais l'appareil.
create table if not exists public.passkeys (
  id text primary key,                 -- identifiant de la clé (base64url)
  owner text not null,                 -- 'admin' ou 'driver:<uuid>'
  public_key text not null,            -- clé publique (base64url)
  counter bigint not null default 0,
  transports text[] not null default '{}',
  name text not null default 'Appareil',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists passkeys_owner_idx on public.passkeys (owner);
alter table public.passkeys enable row level security; -- accès serveur uniquement
