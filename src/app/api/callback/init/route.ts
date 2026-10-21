import { NextResponse } from "next/server";
import { COUNTRIES, guessCountry, makeFormToken, otpConfigured } from "@/lib/callback";

export const dynamic = "force-dynamic";
export function GET(req: Request) {
  return NextResponse.json({ token: makeFormToken(), otp: otpConfigured(), country: guessCountry(req), countries: COUNTRIES }, { headers: { "Cache-Control": "no-store" } });
}
