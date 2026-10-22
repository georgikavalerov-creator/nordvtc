-- Trajet retour : deux réservations liées par group_id (le retour porte is_return = true).
alter table public.bookings add column if not exists group_id uuid, add column if not exists is_return boolean not null default false;
create index if not exists bookings_group_idx on public.bookings(group_id);
