import { deleteAccount } from "../actions";
import { requireUser } from "@/lib/account";
import FaceIdManager from "@/components/FaceIdManager";
import { listPasskeys } from "@/lib/passkey";
import { clientPkDelete, clientPkRegOptions, clientPkRegVerify } from "../actions";

export const metadata = { title: "Sécurité et confidentialité" };
const NAMES: Record<string, string> = { google: "Google", apple: "Apple", email: "Lien par e-mail" };

export default async function Securite() {
  const user = await requireUser("/compte/securite");
  const providers = (user.app_metadata?.providers as string[] | undefined) ?? ["email"];
  return (
    <>
      <h1 className="acc-title">Sécurité et confidentialité</h1>
      <h2 className="acc-h">Méthodes de connexion</h2>
      <ul className="place-list">
        {providers.map((p) => <li key={p}><span aria-hidden="true">🔐</span><span><strong>{NAMES[p] ?? p}</strong><br /><span className="muted">{user.email}</span></span><span className="pill ok">Actif</span></li>)}
      </ul>
      <p style={{ marginTop: 14 }}><a className="btn ghost small" href="/compte/nouveau-mot-de-passe">Définir ou changer mon mot de passe</a></p>
      <form action="/auth/signout" method="post" style={{ marginTop: 14 }}><button className="btn ghost small">Se déconnecter</button></form>

      <h2 className="acc-h">Face ID</h2>
      <FaceIdManager scope={`u-${user.id.slice(0, 8)}`} list={await listPasskeys(`user:${user.id}`)} getOptions={clientPkRegOptions} save={clientPkRegVerify} remove={clientPkDelete} />

      <h2 className="acc-h">Mes données</h2>
      <p className="muted">Téléchargez une copie de vos informations : profil, adresses enregistrées et réservations (format JSON).</p>
      <a className="btn ghost small" href="/compte/export" download>Télécharger mes données</a>

      <h2 className="acc-h">Supprimer mon compte</h2>
      <p className="muted">Votre profil, vos adresses et vos avis sont effacés définitivement. Les réservations passées sont conservées sans lien avec votre compte, pour la comptabilité (obligation légale).</p>
      <form action={deleteAccount} className="form callgate">
        <label>Tapez SUPPRIMER pour confirmer<input name="confirm" required pattern="SUPPRIMER" autoComplete="off" /></label>
        <button className="btn danger">Supprimer définitivement mon compte</button>
      </form>
    </>
  );
}
