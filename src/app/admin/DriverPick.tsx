"use client";
import { useRef } from "react";
import { assignDriver } from "./actions";

export type DriverOpt = { id: string; name: string };

/** Choix du chauffeur affiché sur le bon : enregistré dès la sélection (un seul geste). */
export default function DriverPick({ bookingId, current, drivers, compact = false }: { bookingId: string; current: string | null; drivers: DriverOpt[]; compact?: boolean }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={assignDriver} className={`drv-pick${compact ? " compact" : ""}`}>
      <input type="hidden" name="id" value={bookingId} />
      <label>{!compact && "Chauffeur sur le bon"}
        <select name="driver_id" defaultValue={current ?? ""} onChange={() => ref.current?.requestSubmit()} aria-label="Chauffeur sur le bon de commande">
          <option value="">Moi (Nord VTC)</option>
          {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
    </form>
  );
}
