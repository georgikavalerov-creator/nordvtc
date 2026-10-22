import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MfaVerify from "@/components/MfaVerify";
import { authClient, currentUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Vérification en deux étapes", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ next?: string }> };

export default async function Verification({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  const u = await currentUser();
  if (!u) redirect(`/compte/connexion?next=${encodeURIComponent(next)}`);
  const { data } = await (await authClient()).auth.mfa.getAuthenticatorAssuranceLevel();
  if (!(data?.nextLevel === "aal2" && data.currentLevel !== "aal2")) redirect(next);
  return (
    <section className="section auth-page">
      <div className="wrap" style={{ maxWidth: 480 }}>
        <div className="auth-card">
          <span className="eyebrow">Espace client</span>
          <h1 style={{ fontSize: "clamp(1.7rem,5vw,2.2rem)" }}>Vérification en deux étapes</h1>
          <p className="muted">Ouvrez votre application d&apos;authentification (Google Authenticator, Mots de passe d&apos;iPhone, 1Password…) et saisissez le code à 6 chiffres de Nord VTC.</p>
          <MfaVerify next={next} />
          <form action="/auth/signout" method="post" style={{ marginTop: 12 }}><button className="linklike">Se déconnecter</button></form>
        </div>
      </div>
    </section>
  );
}
