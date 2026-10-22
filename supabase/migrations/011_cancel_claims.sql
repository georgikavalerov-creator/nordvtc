-- Demandes d'annulation sans frais sur justificatif (train ou vol annulé), validées à la main par l'exploitant.
create table if not exists public.cancel_claims (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('train', 'avion')),
  file_path text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'refused')),
  decided_at timestamptz
);
create index if not exists cancel_claims_booking_idx on public.cancel_claims(booking_id);
create index if not exists cancel_claims_pending_idx on public.cancel_claims(status) where status = 'pending';
alter table public.cancel_claims enable row level security; -- accès uniquement côté serveur (service_role)

-- Espace de stockage privé pour les justificatifs (5 Mo max, images et PDF).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('justificatifs', 'justificatifs', false, 5242880, array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do nothing;
