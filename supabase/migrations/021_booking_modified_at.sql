-- Modification d'une réservation confirmée par le client (date de la dernière modification).
alter table public.bookings add column if not exists modified_at timestamptz;
