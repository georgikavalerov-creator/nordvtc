-- Option « animal de compagnie » : sur la réservation et en préférence du profil.
alter table public.bookings add column if not exists pet boolean not null default false;
alter table public.profiles add column if not exists default_pet boolean not null default false;
