// Icônes multicolores (illustrations plates à dégradés) pour les cartes « Où voulez-vous aller ? ».
// Dessinées sur une grille 48 × 48. Les dégradés portent des identifiants fixes : plusieurs cartes
// peuvent afficher la même icône, les définitions sont identiques.
type Name = "plane" | "train" | "road" | "coast" | "rings" | "clock" | "party" | "briefcase" | "city";

const ICONS: Record<Name, React.ReactNode> = {
  plane: (
    <>
      <defs>
        <linearGradient id="ci-pl-a" x1="6" y1="40" x2="42" y2="8" gradientUnits="userSpaceOnUse"><stop stopColor="#1d4ed8" /><stop offset="1" stopColor="#60a5fa" /></linearGradient>
        <linearGradient id="ci-pl-b" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fdba74" /><stop offset="1" stopColor="#f97316" /></linearGradient>
      </defs>
      <path d="M21 25 9 21.5c-1.4-.4-1.6-2.3-.3-3l1.8-.9a3 3 0 0 1 2.3-.2L25 21z" fill="url(#ci-pl-b)" />
      <path d="m24.5 30.5-2.7 10.6c-.3 1.3 1.2 2.2 2.2 1.3l1.3-1.2a3 3 0 0 0 .8-1.4L29 29z" fill="url(#ci-pl-b)" />
      <path d="M40.8 7.2c1.9 1.9.8 5.6-1.8 8.2L17.3 37.1l-5.9 1.7c-1.1.3-2.1-.7-1.8-1.8l1.7-5.9L32.6 9c2.6-2.6 6.3-3.7 8.2-1.8z" fill="url(#ci-pl-a)" />
      <circle cx="33" cy="15" r="2.3" fill="#e0f2fe" />
      <circle cx="27.4" cy="20.6" r="1.6" fill="#e0f2fe" opacity=".85" />
      <circle cx="23" cy="25" r="1.6" fill="#e0f2fe" opacity=".7" />
      <path d="M5 44c6-1 9-3 11-6" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".8" />
    </>
  ),
  train: (
    <>
      <defs>
        <linearGradient id="ci-tr-a" x1="10" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#f87171" /><stop offset="1" stopColor="#b91c1c" /></linearGradient>
      </defs>
      <path d="M16 38 11 45M32 38l5 7" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="10" y="4" width="28" height="35" rx="9" fill="url(#ci-tr-a)" />
      <rect x="14" y="9" width="20" height="12" rx="3.5" fill="#1e293b" />
      <path d="M15.5 19.5 33 10.5v3l-15 7.5z" fill="#fff" opacity=".18" />
      <rect x="10" y="24" width="28" height="3" fill="#fde68a" opacity=".55" />
      <circle cx="16.5" cy="32" r="2.6" fill="#fde047" />
      <circle cx="31.5" cy="32" r="2.6" fill="#fde047" />
      <rect x="21" y="30.5" width="6" height="3" rx="1.5" fill="#7f1d1d" />
    </>
  ),
  road: (
    <>
      <defs>
        <linearGradient id="ci-rd-a" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#86efac" /><stop offset="1" stopColor="#16a34a" /></linearGradient>
        <linearGradient id="ci-rd-b" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#475569" /><stop offset="1" stopColor="#1e293b" /></linearGradient>
      </defs>
      <path d="M4 30c8-5 16-6 22-5s13 1 18-3v20H4z" fill="url(#ci-rd-a)" />
      <path d="M18 44 22.5 22h3L30 44z" fill="url(#ci-rd-b)" />
      <path d="M24 26v3M24 32.5v4M24 40v3" stroke="#fde047" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M33 4c-4.4 0-8 3.4-8 7.8C25 17.6 33 25 33 25s8-7.4 8-13.2C41 7.4 37.4 4 33 4z" fill="#ef4444" />
      <circle cx="33" cy="11.8" r="3.2" fill="#fff" />
      <circle cx="10" cy="12" r="4.5" fill="#fbbf24" />
    </>
  ),
  coast: (
    <>
      <defs>
        <linearGradient id="ci-co-a" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fde047" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        <linearGradient id="ci-co-b" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#38bdf8" /><stop offset="1" stopColor="#0369a1" /></linearGradient>
      </defs>
      <circle cx="30" cy="17" r="9" fill="url(#ci-co-a)" />
      <path d="M30 3v3M41 17h3M39.9 7.1l-2.1 2.1M20.1 7.1l2.1 2.1" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 30c4 0 4-3 8-3s4 3 8 3 4-3 8-3 4 3 8 3 4-3 8-3 4 3 2 3v15H3z" fill="url(#ci-co-b)" />
      <path d="M5 37c3.5 0 3.5-2.5 7-2.5s3.5 2.5 7 2.5 3.5-2.5 7-2.5 3.5 2.5 7 2.5 3.5-2.5 7-2.5" stroke="#e0f2fe" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".8" />
      <path d="M8 26 14 13l6 13z" fill="#f8fafc" /><path d="M14 13v13" stroke="#94a3b8" strokeWidth="1.2" />
    </>
  ),
  rings: (
    <>
      <defs>
        <linearGradient id="ci-ri-a" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fde68a" /><stop offset=".55" stopColor="#f59e0b" /><stop offset="1" stopColor="#b45309" /></linearGradient>
        <linearGradient id="ci-ri-b" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f9a8d4" /><stop offset="1" stopColor="#db2777" /></linearGradient>
      </defs>
      <circle cx="18" cy="29" r="10.5" fill="none" stroke="url(#ci-ri-a)" strokeWidth="4" />
      <circle cx="30" cy="29" r="10.5" fill="none" stroke="url(#ci-ri-a)" strokeWidth="4" />
      <path d="M26 15.5 30.5 9h-9z" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" strokeLinejoin="round" />
      <path d="M40 6.5c-.9-1.9-4-1.6-4 .6 0 1.8 2.5 3.2 4 4.3 1.5-1.1 4-2.5 4-4.3 0-2.2-3.1-2.5-4-.6z" fill="url(#ci-ri-b)" />
      <path d="M8 9.5c-.7-1.4-3-1.2-3 .5 0 1.3 1.9 2.4 3 3.2 1.1-.8 3-1.9 3-3.2 0-1.7-2.3-1.9-3-.5z" fill="#f472b6" />
    </>
  ),
  clock: (
    <>
      <defs>
        <linearGradient id="ci-cl-a" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a5b4fc" /><stop offset="1" stopColor="#4338ca" /></linearGradient>
      </defs>
      <circle cx="24" cy="25" r="18" fill="url(#ci-cl-a)" />
      <circle cx="24" cy="25" r="13.5" fill="#eef2ff" />
      <path d="M24 14.5v2.5M24 33v2.5M13.5 25H16M32 25h2.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 25v-7" stroke="#1e1b4b" strokeWidth="2.6" strokeLinecap="round" />
      <path d="m24 25 6 4" stroke="#f97316" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="25" r="2" fill="#1e1b4b" />
      <path d="M17 4.5h14" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  party: (
    <>
      <defs>
        <linearGradient id="ci-pa-a" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#c084fc" /></linearGradient>
      </defs>
      <path d="M6 43 17 14l17 17z" fill="url(#ci-pa-a)" />
      <path d="m11.5 28.5 8 8M14.5 21l12.5 12.5" stroke="#fde047" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M26 12c2-3 6-4 8-2M35 22c3-1 6 0 7 3" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="31" cy="5" r="2.2" fill="#f43f5e" /><circle cx="42" cy="13" r="2.2" fill="#facc15" />
      <circle cx="40" cy="33" r="2" fill="#34d399" /><circle cx="22" cy="6.5" r="1.6" fill="#38bdf8" />
      <path d="m37 4 1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#f59e0b" />
    </>
  ),
  briefcase: (
    <>
      <defs>
        <linearGradient id="ci-br-a" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fbbf24" /><stop offset="1" stopColor="#b45309" /></linearGradient>
      </defs>
      <path d="M17 13V9.5A3.5 3.5 0 0 1 20.5 6h7A3.5 3.5 0 0 1 31 9.5V13" stroke="#78350f" strokeWidth="3" fill="none" />
      <rect x="4" y="13" width="40" height="28" rx="6" fill="url(#ci-br-a)" />
      <path d="M4 22c6 4 13 6 20 6s14-2 20-6" stroke="#92400e" strokeWidth="2" fill="none" opacity=".6" />
      <rect x="20" y="24" width="8" height="7" rx="2" fill="#1f2937" />
      <rect x="22.3" y="26.2" width="3.4" height="2.6" rx="1" fill="#fde68a" />
    </>
  ),
  city: (
    <>
      <defs>
        <linearGradient id="ci-ci-a" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#60a5fa" /><stop offset="1" stopColor="#1e40af" /></linearGradient>
        <linearGradient id="ci-ci-b" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c4b5fd" /><stop offset="1" stopColor="#6d28d9" /></linearGradient>
      </defs>
      <rect x="6" y="18" width="14" height="25" rx="2" fill="url(#ci-ci-b)" />
      <path d="M20 43V9l10-5 10 5v34z" fill="url(#ci-ci-a)" />
      <path d="M25 14h2M33 14h2M25 20h2M33 20h2M25 26h2M33 26h2M10 24h2M14 24h2M10 30h2M14 30h2" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
      <rect x="27" y="34" width="6" height="9" rx="1" fill="#fde047" />
      <path d="M3 43h42" stroke="#334155" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
};

/** Icône par trajet : catégorie, puis cas particuliers. */
export function colorIconFor(slug: string, category: string): Name {
  if (slug === "mariage") return "rings";
  if (slug === "entreprises") return "briefcase";
  if (slug === "mise-a-disposition") return "clock";
  if (slug === "sorties-evenements") return "party";
  if (slug === "lille-cote-opale") return "coast";
  if (slug === "lille-paris" || slug === "lille-bruxelles") return "city";
  if (category === "Aéroports" || slug.startsWith("aeroport")) return "plane";
  if (category === "Gares" || slug.startsWith("gare")) return "train";
  return "road";
}

export default function ColorIcon({ name, size = 34 }: { name: Name; size?: number }) {
  return (
    <svg className="ico-color" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}
