import type { Metadata } from "next";
import { DriverPage } from "../gate";
import { PasswordForm, ProfileForm } from "../Forms";
import LogoUploader from "@/components/LogoUploader";
import { driverPkDelete, driverPkRegOptions, driverPkRegVerify, removeDriverLogo, saveDriverLogo, saveDriverPhoto } from "../actions";
import FaceIdManager from "@/components/FaceIdManager";
import { listPasskeys } from "@/lib/passkey";
import { currentDriver } from "@/lib/driver-auth";
import AvatarField from "@/components/AvatarField";

export const metadata: Metadata = { title: "Mon profil", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await currentDriver();
  const pk = me ? await listPasskeys(`driver:${me.id}`) : [];
  return (
    <DriverPage title="Mon profil">
      {(d) => (
        <>
          <AvatarField avatar={(d as { photo?: string | null }).photo ?? null} name={d.name} save={saveDriverPhoto} hint="Votre photo de chauffeur, affichée dans votre espace. Recadrée automatiquement." />
          <LogoUploader current={(d as { logo?: string | null }).logo ?? null} save={saveDriverLogo} remove={removeDriverLogo} />
          <ProfileForm d={d} />
          <FaceIdManager list={pk} getOptions={driverPkRegOptions} save={driverPkRegVerify} remove={driverPkDelete} />
          <PasswordForm />
        </>
      )}
    </DriverPage>
  );
}
