import type { Metadata } from "next";
import Link from "next/link";
import AccountNav from "@/components/AccountNav";
import FaceIdPrompt from "@/components/FaceIdPrompt";
import UndoBar from "@/components/UndoBar";
import { getProfile, requireUser } from "@/lib/account";
import { listPasskeys } from "@/lib/passkey";
import { clientPkRegOptions, clientPkRegVerify } from "./actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const name = profile.full_name || (user.user_metadata?.full_name as string | undefined) || (user.email ?? "").split("@")[0];
  const first = name.split(" ")[0];
  const initials = name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <section className="acc-shell">
      <div className="wrap acc-wrap">
        <header className="acc-top">
          <div className="acc-id">
            <Link href="/compte/profil" className="acc-avatar" aria-label="Mon profil">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profile.avatar ? <img src={profile.avatar} alt="" width={56} height={56} /> : initials}
            </Link>
            <div>
              <span className="acc-hello">Bonjour {first}</span>
              <small>{user.email}</small>
            </div>
          </div>
          <Link href="/reservation" className="btn acc-cta">Réserver un trajet</Link>
        </header>
        <FaceIdPrompt count={(await listPasskeys(`user:${user.id}`).catch(() => [])).length} getOptions={clientPkRegOptions} save={clientPkRegVerify} storeKey={`u-${user.id.slice(0, 8)}`} />
        <div className="acc-grid">
          <AccountNav />
          <div className="acc-body">{children}</div>
        </div>
        <UndoBar />
      </div>
    </section>
  );
}
