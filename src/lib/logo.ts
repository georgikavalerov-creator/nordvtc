import { db, dbConfigured } from "./supabase";

// Valide l'image envoyée (PNG, JPEG ou WebP, vérifiée par son contenu et non son nom) et la renvoie en data-URL.
// Pas de redimensionnement côté serveur (sharp n'existe pas sur Cloudflare Workers) : le logo doit rester léger.
const MAX_LOGO_BYTES = 300_000;

function sniffMime(b: Uint8Array): string | null {
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

export async function processLogo(file: File): Promise<{ url: string } | { error: string }> {
  if (!file || file.size === 0) return { error: "Choisissez une image." };
  if (file.size > MAX_LOGO_BYTES) return { error: "Image trop lourde (300 Ko maximum) : exportez le logo en 600 px de large environ." };
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return { error: "Format accepté : PNG, JPEG ou WebP." };
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniffMime(bytes);
    if (!mime) return { error: "Image illisible." };
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { url: `data:${mime};base64,${btoa(bin)}` };
  } catch {
    return { error: "Image illisible." };
  }
}

export async function getLogo(): Promise<string | null> {
  if (!dbConfigured()) return null;
  try {
    const { data } = await db().from("settings").select("value").eq("key", "logo").maybeSingle();
    const u = (data?.value as { url?: string } | undefined)?.url;
    return u && u.startsWith("data:image/") ? u : null;
  } catch { return null; }
}
