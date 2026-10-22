import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { coursesFromImage, coursesFromText, withPlaces } from "@/lib/ai-extract";

export const dynamic = "force-dynamic";

// Administration : { image: dataURL } (capture d'écran) ou { text, date?, time?, ref? } (événement d'agenda)
// → courses détectées, adresses déjà géolocalisées pour pré-remplir le bon de commande.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { image?: string; text?: string; date?: string; time?: string; ref?: string; from?: string; to?: string } | null;
  if (!b) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  try {
    if (typeof b.image === "string") {
      if (!/^data:image\/(jpeg|png|webp);base64,/.test(b.image) || b.image.length > 4_500_000) return NextResponse.json({ error: "Image non prise en charge (JPEG/PNG, 3 Mo max)." }, { status: 400 });
      const list = await coursesFromImage(b.image);
      return NextResponse.json({ courses: await withPlaces(list) });
    }
    if (typeof b.text === "string" && b.text.trim()) {
      const list = (await coursesFromText(b.text)).slice(0, 1);
      if (!list.length) list.push({ name: "", phone: "", email: "", date: "", time: "", from: "", to: "", passengers: 1, luggage: 0, price: null, flight: "", notes: b.text.slice(0, 500), company: "" });
      // La date et l'heure de l'événement font foi (plus fiables que la lecture du texte).
      // Les adresses saisies dans le champ « Lieu » des événements priment aussi.
      for (const c of list) { if (b.date) c.date = b.date; if (b.time) c.time = b.time; if (b.from) c.from = b.from.slice(0, 250); if (b.to) c.to = b.to.slice(0, 250); }
      const found = await withPlaces(list);
      return NextResponse.json({ courses: found.map((c) => ({ ...c, ref: b.ref })) });
    }
    return NextResponse.json({ error: "Rien à analyser." }, { status: 400 });
  } catch (e) {
    console.error("import ia", e);
    return NextResponse.json({ error: "Lecture impossible pour le moment, réessayez." }, { status: 502 });
  }
}
