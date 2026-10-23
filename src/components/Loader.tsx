import type { CSSProperties, ReactNode } from "react";

type Props = {
  /** Taille en pixels (défaut 18). */
  size?: number;
  /** Durée d'un tour en millisecondes (défaut 1200). */
  duration?: number;
  className?: string;
  /** Texte lu par les lecteurs d'écran ; sans lui, l'indicateur est décoratif. */
  label?: string;
};

const vars = (size: number, duration: number) => ({ "--ld-s": `${size}px`, "--ld-d": `${duration}ms` }) as CSSProperties;
const a11y = (label?: string) => (label ? { role: "status", "aria-label": label } : { "aria-hidden": true as const });

/** Indicateur « classique » : douze barres en couronne qui s'estompent. Prend la couleur du texte. */
export function Loader({ size = 18, duration = 1200, className = "", label }: Props) {
  return (
    <span className={`ld-classic ${className}`} style={vars(size, duration)} {...a11y(label)}>
      {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}
    </span>
  );
}

/** Anneau plat : cercle de fond discret + arc aux bouts arrondis qui tourne (champs de recherche). */
export function Ring({ size = 18, duration = 800, className = "", label }: Props) {
  return (
    <span className={`ld-ring ${className}`} style={vars(size, duration)} {...a11y(label)}>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".16" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Trois points en ligne qui pulsent tour à tour (calculs, attente courte dans un texte). */
export function Dots({ size = 18, duration = 1000, className = "", label }: Props) {
  return (
    <span className={`ld-dots ${className}`} style={vars(size, duration)} {...a11y(label)}>
      <i /><i /><i />
    </span>
  );
}

/**
 * Contenu de bouton avec état « en cours ».
 * Les deux états sont superposés dans la même cellule : le bouton garde sa largeur, rien ne bouge autour.
 * Sans `busyText`, seul l'indicateur s'affiche.
 */
export function BusyLabel({ busy, busyText, children }: { busy: boolean; busyText?: string; children: ReactNode }) {
  return (
    <span className="busy-label" data-busy={busy || undefined}>
      <span className="bl-idle" aria-hidden={busy || undefined}>{children}</span>
      <span className="bl-busy" aria-hidden={!busy || undefined}>
        <Loader size={16} />
        {busyText ? <span>{busyText}</span> : <span className="sr-only">Chargement</span>}
      </span>
    </span>
  );
}
