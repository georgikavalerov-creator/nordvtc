"use client";

import { useActionState } from "react";
import { savePricing } from "./actions";
import type { Pricing } from "@/lib/pricing";

const FIELDS: { name: keyof Pricing; label: string; step?: string }[] = [
  { name: "baseFare", label: "Prise en charge (€)", step: "0.5" },
  { name: "perKm", label: "Prix au km (€)", step: "0.01" },
  { name: "perMinute", label: "Prix à la minute (€)", step: "0.01" },
  { name: "minimumFare", label: "Course minimum (€)", step: "0.5" },
  { name: "nightSurchargePct", label: "Majoration de nuit (%)" },
  { name: "nightStartHour", label: "Début nuit (heure)" },
  { name: "nightEndHour", label: "Fin nuit (heure)" },
  { name: "depositPct", label: "Acompte (% du prix)" },
  { name: "minLeadHours", label: "Délai minimum de réservation (h)" },
  { name: "maxDistanceKm", label: "Distance max en ligne (km)" },
];

export default function PricingForm({ pricing }: { pricing: Pricing }) {
  const [state, action, pending] = useActionState(savePricing, undefined);
  return (
    <form action={action} className="form">
      <div className="row three">
        {FIELDS.map((f) => (
          <label key={f.name}>
            {f.label}
            <input name={f.name} type="number" step={f.step ?? "1"} defaultValue={pricing[f.name]} required />
          </label>
        ))}
      </div>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      {state?.ok && <p className="notice">Tarifs enregistrés : ils s'appliquent aux prochains calculs.</p>}
      <button className="btn" disabled={pending} style={{ justifySelf: "start" }}>
        {pending ? "Enregistrement…" : "Enregistrer les tarifs"}
      </button>
    </form>
  );
}
