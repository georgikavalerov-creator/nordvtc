"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/app/compte/(espace)/actions";

export default function CancelTrip({ id, refundLabel, keptLabel, action, full = false }: { id: string; refundLabel: string | null; keptLabel: string | null; full?: boolean; action?: () => Promise<{ ok?: boolean; error?: string }> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  if (!open) return <button type="button" className={`btn ghost${full ? "" : " small"}`} onClick={() => setOpen(true)}>Annuler ce trajet</button>;
  return (
    <div className="cancel-box" role="alertdialog" aria-label="Confirmer l'annulation">
      <p><strong>Annuler ce trajet ?</strong></p>
      <p className="muted" style={{ margin: 0 }}>
        {refundLabel ? <>Annulation gratuite : <strong>{refundLabel}</strong> remboursés sur votre moyen de paiement.</> : keptLabel ? <>Le trajet est dans moins de 24 h : l'acompte de <strong>{keptLabel}</strong> reste acquis (voir CGV).</> : "Aucun paiement n'a été effectué."}
      </p>
      {err && <p className="error" role="alert">{err}</p>}
      <div className="trip-actions">
        <button type="button" className="btn small danger" disabled={pending} onClick={() => start(async () => { const r = await (action ? action() : cancelBooking(id)); if (r.error) setErr(r.error); else router.refresh(); })}>{pending ? "Annulation…" : "Oui, annuler"}</button>
        <button type="button" className="btn small ghost" disabled={pending} onClick={() => { setOpen(false); setErr(""); }}>Garder ma réservation</button>
      </div>
    </div>
  );
}
