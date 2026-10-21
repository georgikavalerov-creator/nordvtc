import { getGoogleReviews, writeReviewUrl } from "@/lib/google-reviews";
import ReviewPrompt from "./ReviewPrompt";

const Stars = ({ n }: { n: number }) => <span className="gstars" aria-label={`${n} sur 5`}>{"★★★★★".slice(0, Math.round(n))}<i>{"★★★★★".slice(Math.round(n))}</i></span>;

// Rubrique « Avis Google » : note + avis récents (si l'API est configurée) et invitation à laisser un avis.
export default async function GoogleReviews() {
  const g = await getGoogleReviews();
  const url = writeReviewUrl();
  if (!g && !url) return null;
  return (
    <section className="section" id="avis">
      <div className="wrap">
        <h2>Avis de nos clients</h2>
        {g && (
          <>
            <p className="g-head">
              <strong>{g.rating.toFixed(1).replace(".", ",")}</strong> <Stars n={g.rating} />
              <span className="muted"> · {g.count} avis sur Google</span>
              {g.mapsUrl && <> · <a href={g.mapsUrl} target="_blank" rel="noopener noreferrer">Voir sur Google</a></>}
            </p>
            {g.reviews.length > 0 && (
              <div className="g-grid">
                {g.reviews.slice(0, 3).map((v, i) => (
                  <blockquote key={i} className="g-card">
                    <Stars n={v.rating} />
                    <p>{v.text}</p>
                    <footer>{v.author}{v.when ? ` · ${v.when}` : ""}</footer>
                  </blockquote>
                ))}
              </div>
            )}
          </>
        )}
        {url && <ReviewPrompt url={url} />}
      </div>
    </section>
  );
}
