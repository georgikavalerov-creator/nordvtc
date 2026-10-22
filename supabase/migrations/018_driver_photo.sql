-- Photo du chauffeur (espace chauffeur), petite image recadrée côté navigateur.
alter table public.drivers add column if not exists photo text check (photo is null or length(photo) <= 200000);
