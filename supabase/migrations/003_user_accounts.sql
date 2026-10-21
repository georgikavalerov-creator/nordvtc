-- Espace personnel : rattache chaque réservation à un compte (Supabase Auth). Les anciennes réservations
-- sont rattachées automatiquement à la première connexion avec la même adresse e-mail vérifiée.
alter table public.bookings add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_email_idx on public.bookings (lower(customer_email));
