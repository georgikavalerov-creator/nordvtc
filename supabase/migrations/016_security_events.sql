-- Journal de sécurité : tentatives d'attaque et connexions (IP, pays, réseau, navigateur, identifiant Cloudflare).
create table if not exists public.security_events (
  id bigserial primary key, at timestamptz not null default now(), kind text not null, severity text not null default 'info',
  ip text, country text, city text, asn int, as_org text, user_agent text, method text, path text, referer text, ray text, detail jsonb
);
create index if not exists security_events_at on public.security_events (at desc);
create index if not exists security_events_ip on public.security_events (ip, at desc);
create index if not exists security_events_kind on public.security_events (kind, at desc);
alter table public.security_events enable row level security;
revoke all on public.security_events from anon, authenticated;
