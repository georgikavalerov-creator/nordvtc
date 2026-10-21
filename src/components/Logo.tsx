import { useId } from "react";

// Emblème : face avant complète d'une Toyota Auris phase 2, tracée au trait d'après photo
// (toit, pare-brise, montants, rétroviseurs, ailes, capot, phares, bandeau chromé en V, calandre à lamelles,
// antibrouillards, pare-chocs, pneus). L'emblème constructeur et la plaque sont laissés vides.
// Au survol (ou au toucher), le bord de chaque phare s'illumine en « épingle » (feu à LED / xénon).
// variant "light" : traits gris acier (fond noir). variant "dark" : traits anthracite (fond clair).
const HL = "M386 338 C440 351 500 366 580 388 L582 397 L487 437 C470 432 420 427 386 421 C379 400 379 360 386 338 Z";
const PIN = "M572 392 C530 382 470 367 396 348 C389 365 389 395 396 412 C430 420 470 425 487 427 L566 399";
const STRUCT = [
  "M590 50 C620 45 700 42 787 42",
  "M586 62 C640 58 720 56 787 56",
  "M590 50 C548 72 500 110 468 168 C455 190 449 203 447 215",
  "M582 66 C545 80 500 120 480 152 C470 172 463 192 462 224 C520 230 650 228 787 228",
  "M476 220 L545 221",
  "M322 214 C330 200 350 190 385 185 C400 183 415 184 421 187 L421 243 C400 252 360 248 335 236 C326 231 322 224 322 214 Z",
  "M326 222 C360 232 400 232 421 226",
  "M421 243 L433 226 L447 215",
  "M433 226 C410 255 385 290 366 330 C348 380 336 440 334 520 C332 580 336 630 346 650",
  "M462 228 C455 260 440 300 388 337",
  "M348 662 L346 718 Q346 726 354 726 L444 726 Q452 726 452 718 L452 670",
];
const SIL = [0, 2, 5, 8, 10]; // contours principaux (traits plus marqués)
const FRONT = [
  "M386 338 C440 351 500 366 580 388 L582 397 L487 437 C470 432 420 427 386 421 C379 400 379 360 386 338 Z",
  "M413 367 C417 385 417 400 413 416",
  "M480 382 L500 425",
  "M378 521 C355 530 342 550 340 580 C340 602 346 614 362 619 C390 624 420 622 446 621 C490 626 520 630 545 632",
  "M378 521 C410 524 470 538 530 552 C580 563 620 574 650 579 L787 581",
  "M460 555 C500 560 560 568 600 575 M460 555 L440 599 L446 621",
  "M453 570 C520 580 640 592 787 594",
  "M446 586 C520 594 640 604 787 606",
  "M440 602 C520 608 640 616 787 618",
  "M545 632 C600 634 700 637 787 637",
  "M340 596 C337 622 342 641 362 649 C420 660 500 664 560 664 C640 664 720 662 787 662",
  "M580 388 C620 391 680 400 722 410 L722 428 C690 421 640 411 588 405 Z",
  "M586 407 C600 430 640 442 665 447 C700 456 712 468 724 476 C745 484 765 487 787 487",
];

export default function Logo({ size = 44, variant = "light" }: { size?: number; variant?: "dark" | "light" }) {
  const id = useId().replace(/:/g, "");
  const fg = variant === "dark" ? "#2b2f36" : "#8a919c"; // gris acier : se fond dans le noir
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  const side = (
    <>
      {STRUCT.map((d, k) => <path key={d} className={SIL.includes(k) ? "lc-s lc-sil" : "lc-s"} d={d} {...ns} />)}
      {FRONT.map((d) => <path key={d} d={d} {...ns} />)}
      <path className="lc-drl" d={PIN} {...ns} />
      <circle cx="461" cy="401" r="19" {...ns} />
      <circle className="lc-lens" cx="461" cy="401" r="9.5" {...ns} />
      <circle className="lc-core" cx="461" cy="401" r="3.4" {...ns} />
      <ellipse cx="383" cy="583" rx="29" ry="32" {...ns} />
      <circle cx="381" cy="583" r="20" {...ns} />
    </>
  );
  const glow = (
    <>
      <path className="lc-drlg" d={PIN} {...ns} />
      <circle className="lc-coreg" cx="461" cy="401" r="9.5" />
    </>
  );
  const flip = "translate(1574 0) scale(-1 1)";
  return (
    <svg className="logo-car" height={size} width={Math.round(size * 1.37)} viewBox="296 34 982 718" aria-hidden="true" focusable="false" style={{ color: fg }}>
      <defs>
        <clipPath id={`c${id}`}><rect x="280" y="30" width="507.4" height="730" /></clipPath>
        <linearGradient id={`s${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="36" x2="0" y2="740">
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".5" />
        </linearGradient>
        <filter id={`g${id}`} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <g className="lc-glow" filter={`url(#g${id})`}>
        <g>{glow}</g>
        <g transform={flip}>{glow}</g>
      </g>
      <g fill="none" stroke={`url(#s${id})`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <g clipPath={`url(#c${id})`}>{side}</g>
        <g transform={flip}><g clipPath={`url(#c${id})`}>{side}</g></g>
        <path className="lc-ground" d="M300 736 C520 746 1054 746 1274 736" />
      </g>
    </svg>
  );
}
