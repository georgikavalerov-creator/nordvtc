"use client";
import { useActionState, useState } from "react";
import IconC from "./IconC";

type R = { ok?: boolean; error?: string } | undefined;

/** Train ou vol annulé : le client dépose un justificatif pour être remboursé en totalité (CGV art. 5). */
export default function ClaimCancel({ action, status }: { action: (prev: R, form: FormData) => Promise<R>; status?: "pending" | "accepted" | "refused" | null }) {
  const [open, setOpen] = useState(false);
  const [state, run, pending] = useActionState(action, undefined);

  if (state?.ok || status === "pending")
    return <p className="notice" role="status" style={{ marginTop: 14 }}>Justificatif reçu : votre demande d'annulation sans frais est en cours de vérification. Vous recevrez un e-mail dès qu'elle sera traitée.</p>;
  if (status === "accepted") return null;

  if (!open)
    return (
      <p className="muted" style={{ marginTop: 14, fontSize: ".95rem" }}>
        {status === "refused" && <>Votre précédent justificatif n'a pas été validé. </>}
        Votre train ou votre vol est annulé ?{" "}
        <button type="button" className="linklike" onClick={() => setOpen(true)}>Demander l'annulation sans frais</button>
      </p>
    );

  return (
    <form action={run} className="cancel-box claim-box" style={{ marginTop: 14 }} aria-label="Annulation sans frais sur justificatif">
      <p style={{ margin: 0 }}><strong>Annulation sans frais sur justificatif</strong></p>
      <p className="muted" style={{ margin: "4px 0 10px", fontSize: ".92rem" }}>
        Joignez la preuve de l'annulation (e-mail ou SMS de la compagnie, capture de l'application). Après vérification, la totalité de la somme payée vous est remboursée, quel que soit le délai.
      </p>
      <fieldset className="date-chips" style={{ border: 0, padding: 0, margin: "0 0 10px" }}>
        <legend className="muted" style={{ fontSize: ".85rem", marginBottom: 4 }}>Qu'est-ce qui a été annulé ?</legend>
        <label className="chip"><input type="radio" name="kind" value="train" required /> <IconC name="train" size={16} /> Mon train</label>
        <label className="chip"><input type="radio" name="kind" value="avion" required /> <IconC name="plane" size={16} /> Mon vol</label>
      </fieldset>
      <label>
        Justificatif (PDF ou photo, 10 Mo max)
        <input type="file" name="file" required accept="application/pdf,image/*" />
      </label>
      <label>
        Message (facultatif)
        <textarea name="note" rows={2} maxLength={500} placeholder="Ex. TGV 7123 supprimé, nouveau train à 18 h" />
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <div className="trip-actions">
        <button type="submit" className="btn small" disabled={pending}>{pending ? "Envoi…" : "Envoyer le justificatif"}</button>
        <button type="button" className="btn small ghost" disabled={pending} onClick={() => setOpen(false)}>Fermer</button>
      </div>
    </form>
  );
}
