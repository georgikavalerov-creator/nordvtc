-- Photo de profil (petite image JPEG recadrée côté navigateur, ~15 Ko) et trajets retirés de l'espace client.
-- Les réservations ne sont jamais effacées (obligations comptables) : on les masque seulement dans le compte.
alter table public.profiles add column if not exists avatar text check (avatar is null or length(avatar) <= 200000);
alter table public.bookings add column if not exists user_hidden_at timestamptz;
