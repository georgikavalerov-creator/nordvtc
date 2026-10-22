import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
import { AdminPage } from "../gate";
import { SettingsForm, TiimeCatchUp } from "../Forms";
import TwoFactor, { TwoFactorChannels } from "../TwoFactor";
import { otpConfigured } from "@/lib/callback";
import { get2fa } from "@/lib/totp";
import LogoUploader from "@/components/LogoUploader";
import { getLogo } from "@/lib/logo";
import { adminPkDelete, adminPkList, adminPkRegOptions, adminPkRegVerify, removeLogo, saveAdminPhoto, saveLogo } from "../actions";
import FaceIdManager from "@/components/FaceIdManager";
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
      <FaceIdManager list={await adminPkList()} getOptions={adminPkRegOptions} save={adminPkRegVerify} remove={adminPkDelete} />
      <TwoFactor enabled={!!tfa.enabled} />
      <TwoFactorChannels email={!!tfa.email} sms={!!tfa.sms} smsAvailable={otpConfigured()} phone={(v.driverPhone || process.env.DRIVER_PHONE || "").trim()} backup={(tfa.backup ?? []).length} />
      <div className="adm-box">
        <strong>Sécurité</strong>
        <p className="muted" style={{ marginBottom: 0 }}>Le mot de passe de l'administration se change dans les variables d'environnement (ADMIN_PASSWORD) de votre hébergeur. Changer ADMIN_SESSION_SECRET déconnecte toutes les sessions.</p>
      </div>
    </AdminPage>
  );
}
