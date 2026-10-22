import type { Metadata } from "next";
import AccountNav from "@/components/AccountNav";
import { getProfile, requireUser } from "@/lib/account";
import FaceIdPrompt from "@/components/FaceIdPrompt";
import { listPasskeys } from "@/lib/passkey";
import { clientPkRegOptions, clientPkRegVerify } from "./actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const name = profile.full_name || (user.user_metadata?.full_name as string | undefined) || (user.email ?? "").split("@")[0];
  return (
    <section className="section acc">
      <div className="wrap" style={{ maxWidth: 900 }}>
        <div className="acc-head">
          <span className="acc-avatar" aria-hidden="true">{profile.avatar ? <img src={profile.avatar} alt="" width={52} height={52} /> : name.slice(0, 1).toUpperCase()}</span>
          <div><strong style={{ fontSize: "1.3rem" }}>{name}</strong><br /><span className="muted">{user.email}</span></div>
        </div>
        <FaceIdPrompt count={(await listPasskeys(`user:${user.id}`).catch(() => [])).length} getOptions={clientPkRegOptions} save={clientPkRegVerify} storeKey={`u-${user.id.slice(0, 8)}`} />
        <AccountNav />
        <div className="acc-body">{children}</div>
      </div>
    </section>
  );
}
