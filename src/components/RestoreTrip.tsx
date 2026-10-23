"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreTrips } from "@/app/compte/(espace)/actions";
import { BusyLabel } from "./Loader";

/** Remet un ou plusieurs trajets de la corbeille dans l'espace client. */
export default function RestoreTrip({ ids, label = "Restaurer", primary = false }: { ids: string[]; label?: string; primary?: boolean }) {
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!ids.length) return null;
  return (
    <>
      <button type="button" className={`btn small trip-restore${primary ? "" : " ghost"}`} disabled={pending} onClick={() => start(async () => {
        const r = await restoreTrips(ids);
        if (r.error) setErr(r.error); else router.refresh();
      })}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
        <BusyLabel busy={pending}>{label}</BusyLabel>
      </button>
      {err && <span className="error" role="alert">{err}</span>}
    </>
  );
}
