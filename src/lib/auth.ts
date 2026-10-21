import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const authConfigured = () => Boolean(url() && anon());

/** Client Supabase lié aux cookies de la requête (session de l'internaute). */
export async function authClient() {
  const store = await cookies();
  return createServerClient(url()!, anon()!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server Component : le middleware s'en charge */ }
      },
    },
  });
}

/** Utilisateur connecté (vérifié auprès de Supabase) ou null. */
export async function currentUser() {
  if (!authConfigured()) return null;
  try {
    const { data } = await (await authClient()).auth.getUser();
    return data.user ?? null;
  } catch { return null; }
}

/** N'autorise que les chemins internes pour la redirection après connexion. */
export const safeNext = (n: string | null | undefined) => (n && /^\/(?!\/)[\w\-/?=&.%]*$/.test(n) ? n : "/compte");
