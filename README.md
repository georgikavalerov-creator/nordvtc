# Nord VTC — site de réservation VTC

Next.js 15 (App Router) + Supabase + Stripe + HERE + Resend. Thème noir et or.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
```

## Ce qu'il faut configurer (dans cet ordre)

1. **Supabase** : créer un projet, puis exécuter `supabase/migrations/001_init.sql` dans l'éditeur SQL.
   Renseigner `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (clé service_role : serveur uniquement, jamais dans le navigateur).
2. **HERE** : créer une clé API (Autosuggest/Discover + Routing) → `HERE_API_KEY`.
3. **Stripe** : `STRIPE_SECRET_KEY` (commencer en mode test). Créer un webhook vers `https://VOTRE-DOMAINE/api/stripe/webhook`
   sur les événements `checkout.session.completed` et `checkout.session.expired`, puis copier le secret dans `STRIPE_WEBHOOK_SECRET`.
   En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
4. **E-mails (Resend)** : `RESEND_API_KEY`, `MAIL_FROM` (domaine vérifié), `MAIL_NOTIFY_TO` (votre adresse pour être prévenu de chaque réservation).
5. **Admin** : `ADMIN_PASSWORD` (long et unique) et `ADMIN_SESSION_SECRET` (au moins 24 caractères aléatoires). Accès : `/admin`.
6. **Coordonnées publiques** : `DRIVER_PHONE` (privé, révélé après formulaire + SMS Twilio), `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_BUSINESS_ADDRESS`, `NEXT_PUBLIC_SITE_URL`.

## À vérifier avant la mise en ligne

- **Tarifs** : valeurs de départ calées sur les prix indicatifs de saiyango.fr (≈ 50 € + 1,65 €/km). Ajustez-les dans `/admin`
  et dans `src/lib/forfaits.ts` (grille affichée sur /tarifs).
- **Pages légales** (`/mentions-legales`, `/cgv`, `/confidentialite`) : modèles à compléter (hébergeur, médiateur, numéro d'inscription VTC) et à faire valider.
- **Textes des services** (`src/lib/services.ts`) : ne gardez que ce que vous faites réellement (siège enfant, eau, suivi de vol, etc.).
- **Photos** : aucune image n'est incluse. Ajoutez de vraies photos (véhicule, vous) dans `public/` pour renforcer la confiance et le SEO.
- **Avis** : aucun faux avis n'est affiché. Ajoutez vos vrais avis Google quand vous en aurez.

## Ajouter une page de trajet (SEO)

Ajouter un objet dans `src/lib/services.ts` : la page, le sitemap et les liens internes se génèrent automatiquement.
Chaque page doit avoir un texte propre (pas seulement le nom de la ville qui change).

## Mise en ligne

Déployer sur Cloudflare Workers (voir « Hébergement »), définir les variables d'environnement, relier le domaine,
puis connecter la Search Console et soumettre `/sitemap.xml`.

## Espace personnel (connexion Google / Apple / e-mail)

1. Appliquer `supabase/migrations/003_user_accounts.sql` puis `004_account_space.sql` (profil, adresses, avis).
2. Renseigner `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API → clé « anon / publishable »).
3. Supabase → Authentication → URL Configuration : *Site URL* = `https://nordvtc.fr`, *Redirect URLs* = `https://nordvtc.fr/auth/callback` (+ `http://localhost:3000/auth/callback` en test).
4. Authentication → Providers :
   - **Email** : activé (lien magique). Personnaliser le modèle d'e-mail en français.
   - **Google** : créer des identifiants OAuth dans Google Cloud Console, redirect URI = `https://<projet>.supabase.co/auth/v1/callback`, coller Client ID + Secret.
   - **Apple** : compte Apple Developer (99 $/an) → Services ID + clé « Sign in with Apple », coller dans Supabase.
5. Les réservations passées avec la même adresse e-mail (vérifiée) apparaissent automatiquement dans l'espace à la première connexion.


## Nom de domaine, hébergement, CMS, mesure

**Domaine** : réserver `nordvtc.fr` (OVH, Gandi…). Sur Cloudflare : le domaine est géré par Cloudflare (serveurs DNS changés chez OVH) ; dans le Worker, Settings → Domains & Routes → Custom domain `nordvtc.fr`. Redirection `www` → domaine nu : règle de redirection Cloudflare (Rules → Redirect Rules). Renseigner `SITE_HOST=nordvtc.fr` (redirection www → domaine nu) et `NEXT_PUBLIC_SITE_URL=https://nordvtc.fr`. Pour les e-mails (Resend) : ajouter les enregistrements SPF/DKIM fournis, sinon les messages partent en spam.

**Hébergement** : Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`, config dans `wrangler.jsonc` et `open-next.config.ts`). Commandes : `npm run preview` (test local dans le runtime Workers), `npm run deploy` (build + déploiement). Variables : celles de `.env.example`, à saisir dans le Worker (Settings → Variables and Secrets), les clés secrètes en « Secret » ; pour le développement local, copier `.dev.vars.example` en `.dev.vars`. Limites connues : pas de `sharp` (le logo envoyé n'est plus redimensionné, il doit faire 300 Ko maximum) ; `src/middleware.ts` reste en runtime edge (le `proxy.ts` de Next 16 n'est pas encore géré par l'adaptateur) ; images de partage (`opengraph-image.png`, `twitter-image.png`) statiques. Le Worker pèse environ 2,4 Mo compressés sur 3 Mo autorisés par le plan gratuit : surveiller avant d'ajouter de grosses dépendances. Webhook Stripe : `https://nordvtc.fr/api/stripe/webhook`. Supabase : appliquer `supabase/migrations/002` à `009`, ajouter l'URL du site dans Authentication → URL Configuration. Indiquer l'hébergeur (Cloudflare) dans les mentions légales.

**CMS** : pas de CMS externe, l'interface `/admin` pilote : tarifs, codes promo, réservations, annulations/remboursements, bons de commande et factures. Les textes des pages se modifient dans `src/lib/service-content.ts` et `src/lib/site.ts`.

**Taux de conversion** : renseigner `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=nordvtc.fr` (mesure sans cookie, pas de bandeau requis). Événements suivis : Prix affiché, Étape 2, Clic paiement, Numéro débloqué. Créer ces objectifs dans Plausible.

## Avis Google

- Affichage : renseigner `GOOGLE_PLACE_ID` (trouvable via l'outil « Place ID Finder » de Google) et `GOOGLE_PLACES_API_KEY` (Google Cloud, activer *Places API (New)*, restreindre la clé à cette API). La note et jusqu'à 3 avis récents (≥ 4★) s'affichent sur l'accueil, rafraîchis toutes les 6 h. Google limite l'API à 5 avis récents.
- Publication : Google interdit de publier un avis automatiquement depuis un site tiers. Le site fait donc choisir les étoiles puis ouvre le formulaire officiel de votre fiche (lien `writereview?placeid=`), où le client valide avec son compte Google. Le même bouton est proposé dans l'espace personnel après une note ≥ 4★.
- Avec seulement `GOOGLE_PLACE_ID`, la rubrique affiche uniquement l'invitation à laisser un avis.
