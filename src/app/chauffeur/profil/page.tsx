import type { Metadata } from "next";
import { DriverPage } from "../gate";
import { PasswordForm, ProfileForm } from "../Forms";
import LogoUploader from "@/components/LogoUploader";
import { removeDriverLogo, saveDriverLogo } from "../actions";

export const metadata: Metadata = { title: "Mon profil", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <DriverPage title="Mon profil">
      {(d) => (
        <>
          <LogoUploader current={(d as { logo?: string | null }).logo ?? null} save={saveDriverLogo} remove={removeDriverLogo} />
          <ProfileForm d={d} />
          <PasswordForm />
        </>
      )}
    </DriverPage>
  );
}
