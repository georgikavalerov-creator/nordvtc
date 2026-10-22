import type { Metadata } from "next";
import { AdminPage } from "../gate";
import { db, dbConfigured } from "@/lib/supabase";
import { icloudConfigured, icloudEvents, type CalEvent } from "@/lib/icloud";
import ImportClient from "./ImportClient";
import { getIcloudSource } from "@/lib/icloud-push";

export const metadata: Metadata = { title: "Administration · Importer des courses", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ImportPage() {
  let events: CalEvent[] = [];
  let calError = "";
  const connected = icloudConfigured();
  if (connected) {
    try { events = await icloudEvents(30, 2, (await getIcloudSource().catch(() => null))?.url); }
    catch (e) { calError = (e as Error).message === "AUTH" ? "iCloud refuse la connexion : vérifiez l'identifiant Apple et le mot de passe d'application." : "Agenda iCloud injoignable pour le moment."; console.error("icloud", e); }
  }
  let done: string[] = [];
  if (events.length && dbConfigured()) {
    const { data } = await db().from("bookings").select("source_ref").in("source_ref", events.map((e) => e.ref)).neq("status", "cancelled");
    done = (data ?? []).map((r) => r.source_ref as string);
  }
  return (
    <AdminPage title="Importer des courses">
      <ImportClient connected={connected} calError={calError} events={events} done={done} />
    </AdminPage>
  );
}
