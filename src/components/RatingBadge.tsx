// Expérience du chauffeur sur les applications de VTC (chiffres fournis par Georgi).
// Volontairement en texte simple : pas de balisage « avis » (les notes d'autres plateformes ne peuvent pas y figurer).
export const RIDES = "5 599";
export const RATING = "4,98";

export default function RatingBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`rating-badge ${className}`} role="note" aria-label={`Note moyenne ${RATING} sur 5, plus de ${RIDES} courses réalisées sur les applications VTC`}>
      <div className="rb-col">
        <span className="rb-big">{RATING}<small>/5</small></span>
        <span className="rb-stars" aria-hidden="true">★★★★★</span>
      </div>
      <span className="rb-div" aria-hidden="true" />
      <div className="rb-col">
        <span className="rb-big">{RIDES}<small>+</small></span>
        <span className="rb-cap">courses sur les applis VTC</span>
      </div>
    </div>
  );
}
