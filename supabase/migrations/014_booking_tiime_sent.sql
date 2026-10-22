-- Envoi des factures PDF à l'adresse de dépôt Tiime
alter table public.bookings add column if not exists tiime_sent_at timestamptz;
