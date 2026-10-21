-- Logo des chauffeurs externes (image réduite, stockée en data-URL ; le logo principal est dans settings, clé "logo").
alter table public.drivers add column if not exists logo text;
