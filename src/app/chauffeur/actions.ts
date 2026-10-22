"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { currentDriver, endDriverSession, hashPassword, startDriverSession, verifyPassword } from "@/lib/driver-auth";
import { createManual } from "@/lib/manual";
import { processLogo } from "@/lib/logo";
import { docPath } from "@/lib/docsign";
import { allow, ipFrom } from "@/lib/ratelimit";
import { guard, logSecurity } from "@/lib/security-log";
import { db } from "@/lib/supabase";

type R = { error?: string; ok?: boolean } | undefined;

export async function loginDriver(_: R, form: FormData): Promise<R> {
  const ip = ipFrom(await headers());
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  // Anti force brute : par adresse IP et par compte visé.
  if (!(await guard(undefined, `driver-login:${ip}`, 8, 15 * 60_000, "driver_login_blocked")) || !(await guard(undefined, `driver-login:${email}`, 10, 3_600_000, "driver_login_blocked"))) return { error: "Trop de tentatives. Réessayez plus tard." };
  let data: { id: string; password_hash: string; active: boolean } | null = null;
  try { data = (await db().from("drivers").select("id,password_hash,active").eq("email", email).maybeSingle()).data; }
  catch { return { error: "Service momentanément indisponible." }; }
  // Même message dans tous les cas : on ne révèle pas si le compte existe.
  if (!data || !data.active || !verifyPassword(String(form.get("password") ?? ""), data.password_hash)) { await logSecurity("driver_login_fail", undefined, { email }); return { error: "E-mail ou mot de passe incorrect." }; }
  await logSecurity("driver_login_ok", undefined, { email });
  await startDriverSession(data.id);
  await db().from("drivers").update({ last_login_at: new Date().toISOString() }).eq("id", data.id);
  redirect("/chauffeur");
}
export async function logoutDriver() { await endDriverSession(); redirect("/chauffeur"); }

export async function createDriverBooking(_: R, form: FormData): Promise<R> {
  const d = await currentDriver();
  if (!d) redirect("/chauffeur");
  const missing = !d.registre || !d.carte_vtc || !d.plaque || !d.insurer || !(d.company || d.name) || !d.siret || !d.address;
  if (missing) return { error: "Complétez d'abord votre profil (société, SIRET, adresse, registre VTC, carte pro, véhicule, assurance) : ces mentions sont obligatoires sur le bon de commande." };
  const r = await createManual(form, d);
  if ("error" in r) return r;
  revalidatePath("/chauffeur", "layout");
  if (r.goto === "bon") redirect(docPath("bon", r.id));
  redirect(`/chauffeur/courses?ouvrir=${r.id}`);
}

export async function cancelDriverBooking(form: FormData) {
  const d = await currentDriver();
  if (!d) redirect("/chauffeur");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (id.success) await db().from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", id.data).eq("driver_id", d.id);
  revalidatePath("/chauffeur", "layout");
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30),
  company: z.string().trim().min(2).max(120),
  legal_form: z.string().trim().max(120),
  siret: z.string().trim().regex(/^\d{14}$/, "SIRET : 14 chiffres, sans espace."),
  address: z.string().trim().min(8).max(250),
  registre: z.string().trim().regex(/^EVTC\d{9}$/i, "N° de registre : « EVTC » suivi de 9 chiffres."),
  carte_vtc: z.string().trim().min(6).max(40),
  vehicule: z.string().trim().min(3).max(80),
  plaque: z.string().trim().min(5).max(15),
  insurer: z.string().trim().min(5).max(250),
  vat_note: z.string().trim().max(200),
});
export async function saveDriverProfile(_: R, form: FormData): Promise<R> {
  const d = await currentDriver();
  if (!d) redirect("/chauffeur");
  const p = profileSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Vérifiez les champs." };
  const { error } = await db().from("drivers").update({ ...p.data, registre: p.data.registre.toUpperCase(), plaque: p.data.plaque.toUpperCase() }).eq("id", d.id);
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/chauffeur", "layout");
  return { ok: true };
}

export async function changeDriverPassword(_: R, form: FormData): Promise<R> {
  const d = await currentDriver();
  if (!d) redirect("/chauffeur");
  const { data } = await db().from("drivers").select("password_hash").eq("id", d.id).single();
  if (!data || !verifyPassword(String(form.get("current") ?? ""), data.password_hash)) return { error: "Mot de passe actuel incorrect." };
  const next = String(form.get("next") ?? "");
  if (next.length < 10) return { error: "Nouveau mot de passe : 10 caractères minimum." };
  await db().from("drivers").update({ password_hash: hashPassword(next) }).eq("id", d.id);
  return { ok: true };
}

export async function saveDriverLogo(_: R, form: FormData): Promise<R> {
  const d = await currentDriver();
  if (!d) redirect("/chauffeur");
  const r = await processLogo(form.get("logo") as File);
  if ("error" in r) return r;
  const { error } = await db().from("drivers").update({ logo: r.url }).eq("id", d.id);
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/chauffeur", "layout");
  return { ok: true };
}
export async function removeDriverLogo(_: R): Promise<R> {
  const d = await currentDriver();
  if (!d) redirect("/chauffeur");
  await db().from("drivers").update({ logo: null }).eq("id", d.id);
  revalidatePath("/chauffeur", "layout");
  return { ok: true };
}
