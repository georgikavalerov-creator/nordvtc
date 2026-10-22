// Contrôle d'une photo envoyée en data URL (déjà recadrée/réduite par le navigateur) :
// format JPEG/PNG/WebP uniquement, signature réelle du fichier vérifiée, 200 Ko maximum.
export function checkPhoto(dataUrl: string): boolean {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!m || dataUrl.length > 200_000) return false;
  const head = Buffer.from(m[2].slice(0, 24), "base64");
  return (m[1] === "jpeg" && head[0] === 0xff && head[1] === 0xd8) || (m[1] === "png" && head[0] === 0x89 && head[1] === 0x50) || (m[1] === "webp" && head.toString("latin1", 8, 12) === "WEBP");
}
