import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getPlaces, getProfile, userBookings } from "@/lib/account";

export const dynamic = "force-dynamic";
export async function GET() {
  const user = await currentUser();
  if (!user) return new NextResponse("Non connecté", { status: 401 });
  const body = { exporte_le: new Date().toISOString(), email: user.email, profil: await getProfile(user.id), adresses: await getPlaces(user.id), reservations: await userBookings(user) };
  return new NextResponse(JSON.stringify(body, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="mes-donnees-nord-vtc.json"', "Cache-Control": "no-store" } });
}
