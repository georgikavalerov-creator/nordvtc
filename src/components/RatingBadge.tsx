// Expérience du chauffeur sur les applications de VTC (chiffres fournis par Georgi).
// Volontairement en texte simple : pas de balisage « avis » (les notes d'autres plateformes ne peuvent pas y figurer).
export const RIDES = "5 599";
export const RATING = "4,98";

export default function RatingBadge({ className = "" }: { className?: string }) {
  return (
    <p className={`rating-badge ${className}`}>
      <span className="rb-score"><span className="rb-stars" aria-hidden="true">★★★★★</span><strong>{RATING}/5</strong></span>
      <span className="rb-text">plus de {RIDES} courses réalisées sur les applications VTC</span>
    </p>
  );
}
