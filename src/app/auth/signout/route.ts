import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth";
import { SITE } from "@/lib/site";

export async function POST() {
  await (await authClient()).auth.signOut();
  return NextResponse.redirect(`${SITE.url}/`, { status: 303 });
}
