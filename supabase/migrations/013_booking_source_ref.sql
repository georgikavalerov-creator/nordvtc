-- Origine d'une course importée (agenda iCloud, capture d'écran) : évite les doublons
alter table public.bookings add column if not exists source_ref text;
create index if not exists bookings_source_ref_idx on public.bookings (source_ref) where source_ref is not null;
