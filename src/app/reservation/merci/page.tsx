import type { Metadata } from "next";
import Link from "next/link";
import { trackPath, verifyTrack } from "@/lib/docsign";
import TrackOnce from "@/components/TrackOnce";

export const metadata: Metadata = {
  title: "Réservation enregistrée",
  robots: { index: false, follow: false },
};
type Props = { searchParams: Promise<{ ref?: string; k?: string }> };

export default async function MerciPage({ searchParams }: Props) {
  const { ref, k } = await searchParams;
  const track = ref && /^[0-9a-f-]{36}$/.test(ref) && verifyTrack(ref, k) ? trackPath(ref) : null;
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 680, textAlign: "center" }}>
        {track && ref && <TrackOnce event="Réservation payée" id={ref} />}
        <span className="eyebrow">Merci</span>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>Votre paiement est reçu</h1>
        <p className="muted">
          Votre réservation sera confirmée dans quelques instants : vous recevrez un e-mail avec le détail du trajet. Pensez à vérifier vos courriers indésirables.
        </p>
        {track ? (
          <p className="muted">
            Vous pouvez suivre votre réservation <strong>sans créer de compte</strong> avec le lien ci-dessous (il figure aussi dans l&apos;e-mail de confirmation). Vous pouvez aussi la retrouver dans <Link href="/compte">votre espace personnel</Link>.
          </p>
        ) : (
          <p className="muted">Une question ou une modification ? Répondez à l&apos;e-mail de confirmation ou passez par la page contact. Retrouvez aussi vos trajets dans <Link href="/compte">votre espace personnel</Link> (connexion avec Google ou votre e-mail).</p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
          <Link href={track ?? "/compte"} className="btn">Suivre ma réservation</Link>
          <Link href="/contact" className="btn ghost">Nous contacter</Link>
        </div>
      </div>
    </section>
  );
}
