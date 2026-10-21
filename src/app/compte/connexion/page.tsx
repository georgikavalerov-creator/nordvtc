import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { authConfigured, currentUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ next?: string; erreur?: string }> };

export default async function Connexion({ searchParams }: Props) {
  const { next, erreur } = await searchParams;
  if (await currentUser()) redirect(safeNext(next));
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Espace personnel</span>
          <h1>Connexion ou création de compte</h1>
          <p className="muted prose">Retrouvez toutes vos réservations, vos factures et vos prochains trajets au même endroit.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap" style={{ maxWidth: 520 }}>
          {authConfigured() ? <AuthForm next={safeNext(next)} failed={!!erreur} /> : <p className="notice">L'espace personnel n'est pas encore ouvert.</p>}
        </div>
      </section>
    </>
  );
}
