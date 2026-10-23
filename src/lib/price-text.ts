/**
 * Prix noté à la main dans un événement d'agenda (titre ou notes) : « 45 € », « 45€ », « 45,50 € »,
 * « 45 euros », « € 45 », « Prix : 45 », « tarif 60 ». Renvoie le montant en centimes, ou null.
 * Les numéros de téléphone, heures et codes postaux ne sont pas pris pour des prix.
 */
export function priceFromText(...texts: (string | null | undefined)[]): number | null {
  const text = texts.filter(Boolean).join("\n");
  if (!text) return null;
  // Milliers séparés par une espace (« 1 245 € ») ou nombre simple, centimes facultatifs.
  const num = String.raw`((?:\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d{1,4})(?:[.,]\d{1,2})?)`;
  const patterns = [
    new RegExp(String.raw`(?<![\d.,])${num}\s?(?:€|eur(?:o|os)?\b)`, "i"),
    new RegExp(String.raw`€\s?${num}(?![\d.,])`, "i"),
    new RegExp(String.raw`\b(?:prix|tarif|montant|total|forfait|course)\s*(?:de|:|=)?\s*${num}(?![\d.,:h])`, "i"),
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    const eur = Number(m[1].replace(/[ \u00a0\u202f]/g, "").replace(",", "."));
    if (Number.isFinite(eur) && eur >= 1 && eur <= 5000) return Math.round(eur * 100);
  }
  return null;
}
