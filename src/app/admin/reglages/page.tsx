import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
import { AdminPage } from "../gate";
import { SettingsForm, TiimeCatchUp } from "../Forms";
import { get2fa } from "@/lib/totp";
import LogoUploader from "@/components/LogoUploader";
import { getLogo } from "@/lib/logo";
import { removeLogo, saveAdminPhoto, saveLogo } from "../actions";
import AvatarField from "@/components/AvatarField";
import { getAdminPhoto } from "@/lib/admin-photo";

export const metadata: Metadata = { title: "Administration · Réglages", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const v = await getSiteSettings();
  const tfa = await get2fa();
  const logo = await getLogo();
  return (
    <AdminPage title="Réglages du site">
      <p className="muted" style={{ margin: 0 }}>Ces informations s'affichent dans les mentions légales, la page contact et les messages envoyés aux clients. Elles s'appliquent dans la minute.</p>
      <div id="photo"><AvatarField avatar={await getAdminPhoto()} name="Georgi" save={saveAdminPhoto} hint="Votre photo, affichée en haut de l'administration. Recadrée automatiquement." /></div>
      <LogoUploader current={logo} save={saveLogo} remove={removeLogo} />
      <SettingsForm v={v} envPhone={Boolean(process.env.DRIVER_PHONE)} />
      <TiimeCatchUp />
      <a href="/admin/securite#protection" className="adm-box adm-link">
        <strong>Face ID et double authentification</strong>
        <span className="muted">{tfa.enabled ? "Double authentification activée" : "Double authentification à activer"} · réglages dans l&apos;onglet Sécurité →</span>
      </a>
    </AdminPage>
  );
}
