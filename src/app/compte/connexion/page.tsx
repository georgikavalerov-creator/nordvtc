import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import Icon from "@/components/Icon";
import RatingBadge from "@/components/RatingBadge";
import { authConfigured, currentUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion à votre espace", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ next?: string; erreur?: string }> };

const PERKS = [
  { icon: "calendarCheck", t: "Vos trajets en un coup d'œil", d: "Suivi, modification et annulation de vos réservations." },
  { icon: "receipt", t: "Factures et bons de commande", d: "Téléchargeables à tout moment, au nom de votre entreprise si besoin." },
  { icon: "house", t: "Adresses enregistrées", d: "Domicile, travail : réservez votre prochain trajet en quelques secondes." },
  { icon: "seal", t: "Connexion Face ID / Touch ID", d: "Sans mot de passe, sécurisée par votre téléphone." },
];

export default async function Connexion({ searchParams }: Props) {
  const { next, erreur } = await searchParams;
  if (await currentUser()) redirect(safeNext(next));
  return (
    <section className="auth-page">
      <div className="wrap auth-grid">
        <div className="auth-card">
          <span className="eyebrow">Espace client</span>
          <h1>Connexion</h1>
          <p className="muted auth-sub">Première visite ? Votre espace est créé automatiquement, en quelques secondes.</p>
          {authConfigured() ? <AuthForm next={safeNext(next)} failed={!!erreur} /> : <p className="notice">L&apos;espace personnel n&apos;est pas encore ouvert.</p>}
          <p className="auth-legal">En continuant, vous acceptez les <Link href="/cgv">conditions générales</Link> et la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
        </div>

        <aside className="auth-brand" aria-label="Pourquoi créer un espace client">
          <div className="auth-brand-top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/chauffeur-avatar-manga.webp" alt="" width={56} height={56} className="auth-avatar" />
            <div>
              <strong>Nord VTC</strong>
              <span>Votre chauffeur privé à Lille</span>
            </div>
          </div>
          <h2>Tout votre transport, au même endroit</h2>
          <ul className="auth-perks">
            {PERKS.map((p) => (
              <li key={p.t}>
                <span className="auth-perk-ico"><Icon name={p.icon} size={22} /></span>
                <span><strong>{p.t}</strong><small>{p.d}</small></span>
              </li>
            ))}
          </ul>
          <RatingBadge className="auth-rating" />
          <p className="auth-trust"><Icon name="lock" size={16} /> Données protégées, jamais revendues · Paiement sécurisé Stripe</p>
        </aside>
      </div>
    </section>
  );
}
