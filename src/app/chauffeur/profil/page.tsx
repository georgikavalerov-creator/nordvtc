import type { Metadata } from "next";
import { DriverPage } from "../gate";
import { PasswordForm, ProfileForm } from "../Forms";
import LogoUploader from "@/components/LogoUploader";
import { removeDriverLogo, saveDriverLogo, saveDriverPhoto } from "../actions";
import AvatarField from "@/components/AvatarField";

export const metadata: Metadata = { title: "Mon profil", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <DriverPage title="Mon profil">
      {(d) => (
        <>
          <AvatarField avatar={(d as { photo?: string | null }).photo ?? null} name={d.name} save={saveDriverPhoto} hint="Votre photo de chauffeur, affichée dans votre espace. Recadrée automatiquement." />
          <LogoUploader current={(d as { logo?: string | null }).logo ?? null} save={saveDriverLogo} remove={removeDriverLogo} />
          <ProfileForm d={d} />
          <PasswordForm />
        </>
      )}
    </DriverPage>
  );
}
