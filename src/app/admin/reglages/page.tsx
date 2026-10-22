import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
import { AdminPage } from "../gate";
import { SettingsForm, TiimeCatchUp } from "../Forms";
import TwoFactor from "../TwoFactor";
import { get2fa } from "@/lib/totp";
import LogoUploader from "@/components/LogoUploader";
import { getLogo } from "@/lib/logo";
import { removeLogo, saveLogo } from "../actions";

export const metadata: Metadata = { title: "Administration · Réglages", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const v = await getSiteSettings();
  const logo = await getLogo();
  return (
    <AdminPage title="Réglages du site">
      <p className="muted" style={{ margin: 0 }}>Ces informations s'affichent dans les mentions légales, la page contact et les messages envoyés aux clients. Elles s'appliquent dans la minute.</p>
      <LogoUploader current={logo} save={saveLogo} remove={removeLogo} />
      <SettingsForm v={v} envPhone={Boolean(process.env.DRIVER_PHONE)} />
      <TiimeCatchUp />
      <TwoFactor enabled={!!(await get2fa()).enabled} />
      <div className="adm-box">
        <strong>Sécurité</strong>
        <p className="muted" style={{ marginBottom: 0 }}>Le mot de passe de l'administration se change dans les variables d'environnement (ADMIN_PASSWORD) de votre hébergeur. Changer ADMIN_SESSION_SECRET déconnecte toutes les sessions.</p>
      </div>
    </AdminPage>
  );
}
