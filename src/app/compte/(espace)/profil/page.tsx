import ProfileForm from "@/components/ProfileForm";
import AvatarField from "@/components/AvatarField";
import { getProfile, requireUser } from "@/lib/account";
import { COUNTRIES } from "@/lib/callback";

export const metadata = { title: "Mon profil" };
export default async function Profil() {
  const user = await requireUser("/compte/profil");
  const profile = await getProfile(user.id);
  return (
    <>
      <h1 className="acc-title">Mon profil</h1>
      <AvatarField avatar={profile.avatar ?? null} name={profile.full_name || (user.user_metadata?.full_name as string) || user.email || "?"} />
      <p className="muted">Ces informations préremplissent vos réservations.</p>
      <ProfileForm profile={{ ...profile, full_name: profile.full_name ?? (user.user_metadata?.full_name as string) ?? null }} email={user.email ?? ""} countries={COUNTRIES} />
    </>
  );
}
