-- Documents légaux : bon de commande (justificatif de réservation préalable), note provisoire, facture numérotée sans rupture.
create table if not exists public.counters (key text primary key, n int not null default 0);
alter table public.counters enable row level security;

alter table public.bookings
  add column if not exists order_number text unique,
  add column if not exists invoice_number text unique,
  add column if not exists invoice_issued_at timestamptz,
  add column if not exists balance_method text check (balance_method in ('card', 'cash', 'none')),
  add column if not exists billing_company text,
  add column if not exists billing_address text,
  add column if not exists billing_siren text;

-- Numérotation atomique (le numéro et la ligne sont écrits dans la même transaction : aucun trou).
create or replace function public.issue_order(bid uuid) returns text
language plpgsql security definer set search_path = public as $$
declare cur text; k int; yr text := to_char(now() at time zone 'Europe/Paris', 'YYYY');
begin
  select order_number into cur from bookings where id = bid for update;
  if not found then return null; end if;
  if cur is not null then return cur; end if;
  insert into counters (key, n) values ('order-' || yr, 1)
    on conflict (key) do update set n = counters.n + 1 returning n into k;
  cur := 'BC-' || yr || '-' || lpad(k::text, 5, '0');
  update bookings set order_number = cur where id = bid;
  return cur;
end $$;

create or replace function public.issue_invoice(bid uuid, method text) returns text
language plpgsql security definer set search_path = public as $$
declare cur text; k int; yr text := to_char(now() at time zone 'Europe/Paris', 'YYYY');
begin
  select invoice_number into cur from bookings where id = bid and status in ('confirmed', 'completed') for update;
  if not found then return null; end if;
  if cur is not null then return cur; end if;
  insert into counters (key, n) values ('invoice-' || yr, 1)
    on conflict (key) do update set n = counters.n + 1 returning n into k;
  cur := 'FA-' || yr || '-' || lpad(k::text, 5, '0');
  update bookings set invoice_number = cur, invoice_issued_at = now(), status = 'completed', balance_method = method where id = bid;
  return cur;
end $$;
revoke all on function public.issue_order(uuid) from public, anon, authenticated;
revoke all on function public.issue_invoice(uuid, text) from public, anon, authenticated;
