// Conversation en cours, gardée dans le navigateur du visiteur (aucun compte nécessaire).
export const CHAT_KEY = "nvtc-chat";
export type Saved = { id: string; token: string; seen: number };
export const loadChat = (): Saved | null => { try { return JSON.parse(localStorage.getItem(CHAT_KEY) || "null"); } catch { return null; } };
export const saveChat = (s: Saved) => { try { localStorage.setItem(CHAT_KEY, JSON.stringify(s)); } catch { /* navigation privée */ } };
export const forgetChat = () => { try { localStorage.removeItem(CHAT_KEY); } catch { /* ignoré */ } };
