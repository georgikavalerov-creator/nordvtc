import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { adminUnread } from "@/lib/chat-unread";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.json(await adminUnread(), { headers: { "Cache-Control": "no-store" } });
}
