import { createHmac, timingSafeEqual } from "node:crypto";
import { suggestPlaces, type Place } from "./here";

// Les adresses proposées par le site sont signées : le serveur peut vérifier que les coordonnées
// envoyées par le navigateur n'ont pas été modifiées (sinon : prix calculé sur un faux trajet).
const key = () => process.env.ADMIN_SESSION_SECRET ?? "nordvtc-places";
const payload = (p: Place) => `${p.label}|${p.lat.toFixed(5)}|${p.lng.toFixed(5)}`;

export const signPlace = (p: Place) => ({ ...p, sig: createHmac("sha256", key()).update(payload(p)).digest("base64url").slice(0, 24) });

/** Adresse fiable : signature valide, sinon coordonnées recalculées à partir du libellé (jamais celles du navigateur). */
export async function trustPlace(p: Place & { sig?: string }): Promise<Place | null> {
  if (p.sig) {
    const good = signPlace({ label: p.label, lat: p.lat, lng: p.lng }).sig;
    if (good.length === p.sig.length && timingSafeEqual(Buffer.from(good), Buffer.from(p.sig))) return { label: p.label, lat: p.lat, lng: p.lng };
  }
  try {
    const r = (await suggestPlaces(p.label.slice(0, 120)))[0];
    return r ? { label: p.label, lat: r.lat, lng: r.lng } : null;
  } catch { return null; }
}
