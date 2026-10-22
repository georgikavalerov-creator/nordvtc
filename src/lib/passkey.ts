import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import {
  generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse,
  type AuthenticationResponseJSON, type RegistrationResponseJSON, type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { db } from "./supabase";

// Connexion par clé d'accès (WebAuthn) : Face ID, Touch ID, empreinte Android, Windows Hello.
// Le visage / l'empreinte restent sur l'appareil ; le site ne reçoit qu'une signature vérifiée avec la clé publique.

const RP_NAME = "Nord VTC";
const CK = "lt_pk";
const secret = () => process.env.ADMIN_SESSION_SECRET || "";
const sig = (s: string) => createHmac("sha256", secret()).update(`pk:${s}`).digest("base64url");
const b64 = (u: Uint8Array) => Buffer.from(u).toString("base64url");
const unb64 = (s: string) => new Uint8Array(Buffer.from(s, "base64url"));

/** Domaine et origine attendus (le domaine du site uniquement, ou localhost en développement). */
async function rp() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "").split(",")[0].trim().toLowerCase();
  const name = host.replace(/:\d+$/, "");
  const ok = name === "nordvtc.fr" || name === "www.nordvtc.fr" || name === "localhost" || name === "127.0.0.1";
  if (!ok) throw new Error("domaine non autorisé");
  const rpID = name === "www.nordvtc.fr" ? "nordvtc.fr" : name;
  const origin = `${name === "localhost" || name === "127.0.0.1" ? "http" : "https"}://${host}`;
  return { rpID, origin };
}

// Défi à usage unique, signé, conservé 5 minutes dans un cookie protégé.
async function keepChallenge(purpose: string, challenge: string) {
  const exp = Math.floor(Date.now() / 1000) + 300;
  (await cookies()).set(CK, `${purpose}.${challenge}.${exp}.${sig(`${purpose}.${challenge}.${exp}`)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 300 });
}
async function takeChallenge(purpose: string): Promise<string | null> {
  const jar = await cookies();
  const v = jar.get(CK)?.value; jar.delete({ name: CK, path: "/" });
  if (!v) return null;
  const [p, c, exp, s] = v.split(".");
  if (p !== purpose || !c || Number(exp) < Date.now() / 1000) return null;
  const a = Buffer.from(sig(`${p}.${c}.${exp}`)), b = Buffer.from(s ?? "");
  return a.length === b.length && timingSafeEqual(a, b) ? c : null;
}

export type PasskeyRow = { id: string; name: string; created_at: string; last_used_at: string | null };
export async function listPasskeys(owner: string): Promise<PasskeyRow[]> {
  const { data } = await db().from("passkeys").select("id,name,created_at,last_used_at").eq("owner", owner).order("created_at");
  return (data as PasskeyRow[]) ?? [];
}
export async function deletePasskey(owner: string, id: string) {
  await db().from("passkeys").delete().eq("owner", owner).eq("id", id);
}

/** Étape 1 de l'enregistrement (utilisateur déjà connecté). */
export async function registrationOptions(owner: string, userName: string, displayName: string) {
  const { rpID } = await rp();
  const existing = (await db().from("passkeys").select("id,transports").eq("owner", owner)).data ?? [];
  const opts = await generateRegistrationOptions({
    rpName: RP_NAME, rpID, userName, userDisplayName: displayName,
    userID: new TextEncoder().encode(owner),
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({ id: c.id, transports: (c.transports ?? []) as AuthenticatorTransportFuture[] })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  await keepChallenge(`reg-${owner}`, opts.challenge);
  return opts;
}

/** Étape 2 : vérifie la réponse de l'appareil et enregistre la clé publique. */
export async function registrationVerify(owner: string, response: RegistrationResponseJSON, name: string): Promise<{ ok?: boolean; error?: string }> {
  const { rpID, origin } = await rp();
  const challenge = await takeChallenge(`reg-${owner}`);
  if (!challenge) return { error: "Délai dépassé, recommencez." };
  try {
    const v = await verifyRegistrationResponse({ response, expectedChallenge: challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true });
    if (!v.verified || !v.registrationInfo) return { error: "Vérification refusée." };
    const c = v.registrationInfo.credential;
    const { error } = await db().from("passkeys").insert({ id: c.id, owner, public_key: b64(c.publicKey), counter: c.counter, transports: c.transports ?? [], name: name.slice(0, 60) || "Appareil" });
    if (error) return { error: "Enregistrement impossible." };
    return { ok: true };
  } catch { return { error: "Vérification refusée." }; }
}

/** Étape 1 de la connexion : défi à signer (l'appareil propose la bonne clé). */
export async function loginOptions(purpose: "admin" | "driver") {
  const { rpID } = await rp();
  const opts = await generateAuthenticationOptions({ rpID, userVerification: "required" });
  await keepChallenge(`auth-${purpose}`, opts.challenge);
  return opts;
}

/** Étape 2 : vérifie la signature ; renvoie le propriétaire de la clé si tout est valide. */
export async function loginVerify(purpose: "admin" | "driver", response: AuthenticationResponseJSON): Promise<string | null> {
  const { rpID, origin } = await rp();
  const challenge = await takeChallenge(`auth-${purpose}`);
  if (!challenge || typeof response?.id !== "string") return null;
  const { data: row } = await db().from("passkeys").select("id,owner,public_key,counter,transports").eq("id", response.id).maybeSingle();
  if (!row) return null;
  if (purpose === "admin" ? row.owner !== "admin" : !String(row.owner).startsWith("driver:")) return null;
  try {
    const v = await verifyAuthenticationResponse({
      response, expectedChallenge: challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true,
      credential: { id: row.id, publicKey: unb64(row.public_key), counter: Number(row.counter), transports: (row.transports ?? []) as AuthenticatorTransportFuture[] },
    });
    if (!v.verified) return null;
    await db().from("passkeys").update({ counter: v.authenticationInfo.newCounter, last_used_at: new Date().toISOString() }).eq("id", row.id);
    return row.owner as string;
  } catch { return null; }
}
