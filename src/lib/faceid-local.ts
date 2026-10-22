// Mémoire locale (sur l'appareil) des clés Face ID créées ou utilisées ici : sert seulement à l'affichage
// (« activé sur cet appareil »). Aucune donnée sensible : identifiants publics de clés.
const K = "nvtc-fid-ids";
const F = (scope: string) => `nvtc-fid-here-${scope}`;
export function localIds(): string[] { try { return JSON.parse(localStorage.getItem(K) || "[]"); } catch { return []; } }
export function rememberId(id: string) { try { const s = new Set(localIds()); s.add(id); localStorage.setItem(K, JSON.stringify([...s].slice(-20))); } catch {} }
export function forgetId(id: string) { try { localStorage.setItem(K, JSON.stringify(localIds().filter((x) => x !== id))); } catch {} }
export function markHere(scope: string, on = true) { try { if (on) localStorage.setItem(F(scope), "1"); else localStorage.removeItem(F(scope)); } catch {} }
export function isHere(scope: string, ids: string[]) { try { return ids.some((i) => localIds().includes(i)) || (ids.length > 0 && localStorage.getItem(F(scope)) === "1"); } catch { return false; } }
