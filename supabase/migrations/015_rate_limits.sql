-- Limites durables (connexions, SMS, formulaires) : partagées entre toutes les instances du site.
create table if not exists public.rate_hits (key text not null, at timestamptz not null default now());
create index if not exists rate_hits_key_at on public.rate_hits (key, at);
alter table public.rate_hits enable row level security;
revoke all on public.rate_hits from anon, authenticated;
create or replace function public.rate_hit(p_key text, p_max int, p_window_s int) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if random() < 0.02 then delete from rate_hits where at < now() - interval '2 days'; end if;
  perform pg_advisory_xact_lock(hashtext(p_key));
  select count(*) into n from rate_hits where key = p_key and at > now() - make_interval(secs => p_window_s);
  if n >= p_max then return false; end if;
  insert into rate_hits(key) values (p_key);
  return true;
end; $$;
revoke execute on function public.rate_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_hit(text, int, int) to service_role;
