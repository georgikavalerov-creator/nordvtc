import type { Metadata } from "next";
import NewPasswordForm from "@/components/NewPasswordForm";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Mot de passe", robots: { index: false, follow: false } };
export default async function Page() {
  await requireUser("/compte/nouveau-mot-de-passe");
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 520 }}>
        <h1 className="acc-title">Définir mon mot de passe</h1>
        <p className="muted">Plus il est long, plus il est solide : visez une phrase de 16 caractères ou plus.</p>
        <NewPasswordForm />
      </div>
    </section>
  );
}
