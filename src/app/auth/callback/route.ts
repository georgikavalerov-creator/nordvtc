import { NextResponse } from "next/server";
import { authClient, safeNext } from "@/lib/auth";
import { SITE } from "@/lib/site";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const next = safeNext(u.searchParams.get("next"));
  if (code) {
    const { error } = await (await authClient()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${SITE.url}${next}`);
  }
  return NextResponse.redirect(`${SITE.url}/compte/connexion?erreur=1`);
}
