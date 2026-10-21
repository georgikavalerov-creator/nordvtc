// Avis Google de la fiche d'établissement (Places API « New »). Nécessite GOOGLE_PLACES_API_KEY et GOOGLE_PLACE_ID.
export type GReview = { author: string; rating: number; text: string; when: string };
export type GReviews = { rating: number; count: number; reviews: GReview[]; mapsUrl?: string } | null;

export const placeId = () => process.env.GOOGLE_PLACE_ID || "";
// Lien officiel qui ouvre directement le formulaire « Écrire un avis » de la fiche Google.
export const writeReviewUrl = () => (placeId() ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId())}` : "");

export async function getGoogleReviews(): Promise<GReviews> {
  const key = process.env.GOOGLE_PLACES_API_KEY, id = placeId();
  if (!key || !id) return null;
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=fr`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews" },
      next: { revalidate: 21600 }, // rafraîchi toutes les 6 h
    });
    if (!r.ok) return null;
    const d = await r.json();
    if (typeof d.rating !== "number") return null;
    return {
      rating: d.rating,
      count: d.userRatingCount ?? 0,
      mapsUrl: d.googleMapsUri,
      reviews: (d.reviews ?? [])
        .filter((v: { rating?: number }) => (v.rating ?? 0) >= 4)
        .map((v: { authorAttribution?: { displayName?: string }; rating: number; text?: { text?: string }; originalText?: { text?: string }; relativePublishTimeDescription?: string }) => ({
          author: v.authorAttribution?.displayName ?? "Client Google",
          rating: v.rating,
          text: (v.text?.text ?? v.originalText?.text ?? "").slice(0, 400),
          when: v.relativePublishTimeDescription ?? "",
        }))
        .filter((v: GReview) => v.text),
    };
  } catch { return null; }
}
