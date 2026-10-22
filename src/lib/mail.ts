import { Resend } from "resend";
import { SITE } from "./site";
import { euro } from "./pricing";
import { getSiteSettings } from "./content";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type BookingMail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  originLabel: string;
  destLabel: string;
  pickupAtLocal: string; // déjà formaté en français
  passengers: number;
  luggage: number;
  childSeat: boolean;
  flight: string | null;
  notes: string | null;
  priceCents: number;
  paidCents: number;
  orderUrl?: string;
  trackUrl?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // e-mails désactivés tant que la clé n'est pas renseignée
  const resend = new Resend(key);
  // Resend renvoie { error } sans lever d'exception : on la journalise, et on retente (limite de débit, erreur passagère).
  for (let attempt = 1; attempt <= 3; attempt++) {
    const from = process.env.MAIL_FROM ?? `${SITE.name} <onboarding@resend.dev>`;
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    if (!error) return;
    console.error(`mail:${subject}:essai ${attempt} expéditeur=${from}`, JSON.stringify(error));
    if (attempt === 3) throw new Error(`Envoi e-mail impossible : ${error.message}`);
    await sleep(900 * attempt);
  }
}

export async function sendBookingEmails(b: BookingMail) {
  const rest = Math.max(0, b.priceCents - b.paidCents);
  const phone = (await getSiteSettings()).driverPhone || process.env.DRIVER_PHONE || "";
  const lines = `
    <p><strong>Trajet</strong><br>${esc(b.originLabel)} → ${esc(b.destLabel)}</p>
    <p><strong>Prise en charge</strong><br>${esc(b.pickupAtLocal)}</p>
    <p><strong>Passagers</strong> ${b.passengers} · <strong>Bagages</strong> ${b.luggage}${b.childSeat ? " · siège enfant demandé" : ""}</p>
    ${b.flight ? `<p><strong>Vol / train</strong> ${esc(b.flight)}</p>` : ""}
    <p><strong>Prix du trajet</strong> ${euro(b.priceCents)}<br><strong>Déjà réglé en ligne</strong> ${euro(b.paidCents)}<br><strong>Reste à régler à bord</strong> ${euro(rest)}</p>
  `;
  let customerError: unknown = null;
  try {
  await send(
    b.email,
    `Réservation confirmée — ${SITE.name}`,
    `<div style="font-family:Georgia,serif;max-width:560px">
      <h2>Votre réservation est confirmée</h2>
      <p>Bonjour ${esc(b.name)}, merci pour votre confiance.</p>
      ${lines}
      <p>Référence : <code>${esc(b.id.slice(0, 8))}</code>${b.orderUrl ? ` · <a href="${esc(b.orderUrl)}">Votre bon de commande</a>` : ""}</p>
      ${b.trackUrl ? `<p><a href="${esc(b.trackUrl)}">Suivre ma réservation</a> (sans connexion : conservez ce lien)</p>` : ""}
      <p>Pour toute modification, répondez à ce message${phone ? ` ou appelez le ${esc(phone)}` : ""}.</p>
    </div>`,
  );
  } catch (e) { customerError = e; } // la notification au chauffeur part quand même
  const notify = process.env.MAIL_NOTIFY_TO;
  if (notify) {
    await sleep(700);
    await send(
      notify,
      `Nouvelle réservation — ${b.originLabel} → ${b.destLabel}`,
      `<div style="font-family:system-ui">
        <h3>Nouvelle réservation payée</h3>
        <p><strong>${esc(b.name)}</strong> — ${esc(b.phone)} — ${esc(b.email)}</p>
        ${lines}
        ${b.notes ? `<p><strong>Notes</strong><br>${esc(b.notes)}</p>` : ""}
        <p>Référence : ${esc(b.id)}</p>
      </div>`,
    );
  }
  if (customerError) throw customerError;
}

export async function sendCancellationEmails(b: { id: string; name: string; email: string; originLabel: string; destLabel: string; pickupAtLocal: string; refundedCents: number; keptCents: number }) {
  const kept = b.keptCents > 0 ? `<p>L'annulation intervient moins de 24 h avant la prise en charge : ${euro(b.keptCents)} restent acquis (montant de l'acompte), conformément aux conditions générales de vente.</p>` : "";
  const money = b.refundedCents > 0
    ? kept + `<p>Un remboursement de <strong>${euro(b.refundedCents)}</strong> a été émis sur votre moyen de paiement (délai bancaire : quelques jours ouvrés).</p>`
    : b.keptCents > 0
      ? `<p>L'annulation intervient moins de 24 h avant la prise en charge : l'acompte de ${euro(b.keptCents)} reste acquis, conformément aux conditions générales de vente.</p>`
      : "";
  const trip = `<p>${esc(b.originLabel)} → ${esc(b.destLabel)}<br>${esc(b.pickupAtLocal)}</p>`;
  await send(b.email, `Réservation annulée — ${SITE.name}`,
    `<div style="font-family:system-ui;max-width:560px"><h2>Votre réservation est annulée</h2><p>Bonjour ${esc(b.name)},</p>${trip}${money}<p>Référence : <code>${esc(b.id.slice(0, 8))}</code></p></div>`);
  const notify = process.env.MAIL_NOTIFY_TO;
  if (notify) await send(notify, `Annulation client — ${b.originLabel} → ${b.destLabel}`,
    `<div style="font-family:system-ui"><h3>Annulation par le client</h3><p>${esc(b.name)} — ${esc(b.email)}</p>${trip}<p>Remboursé : ${euro(b.refundedCents)} · conservé : ${euro(b.keptCents)}</p><p>Réf. ${esc(b.id)}</p></div>`);
}

export async function sendInvoiceEmail(b: { name: string; email: string; number: string; url: string }) {
  await send(b.email, `Votre facture ${b.number} — ${SITE.name}`,
    `<div style="font-family:system-ui;max-width:560px"><h2>Merci pour votre trajet</h2><p>Bonjour ${esc(b.name)}, votre facture n° ${esc(b.number)} est disponible : <a href="${esc(b.url)}">ouvrir la facture</a> (imprimable / PDF).</p></div>`);
}

// ---------- Annulation sur justificatif (train ou vol annulé) ----------
export async function sendClaimReceived(b: { id: string; name: string; email: string; trip: string; kind: string; fileUrl: string; note: string | null }) {
  await send(b.email, `Demande d'annulation reçue — ${SITE.name}`,
    `<div style="font-family:system-ui;max-width:560px"><h2>Nous avons bien reçu votre justificatif</h2><p>Bonjour ${esc(b.name)},</p><p>${esc(b.trip)}</p><p>Votre demande d'annulation sans frais (${esc(b.kind)} annulé) est en cours de vérification. Vous recevrez un e-mail dès qu'elle sera traitée ; en cas d'accord, la totalité de la somme payée vous sera remboursée.</p><p>Référence : <code>${esc(b.id.slice(0, 8))}</code></p></div>`);
  const notify = process.env.MAIL_NOTIFY_TO;
  if (notify) await send(notify, `Justificatif à vérifier — ${b.kind} annulé`,
    `<div style="font-family:system-ui"><h3>Demande d'annulation sans frais</h3><p>${esc(b.name)} — ${esc(b.email)}</p><p>${esc(b.trip)}</p>${b.note ? `<p>Message : « ${esc(b.note)} »</p>` : ""}<p><a href="${esc(b.fileUrl)}">Voir le justificatif</a> (lien valable 7 jours)</p><p><a href="${SITE.url}/admin/reservations">Accepter ou refuser dans l'administration</a></p><p>Réf. ${esc(b.id)}</p></div>`);
}

export async function sendClaimDecision(b: { id: string; name: string; email: string; trip: string; accepted: boolean; refundedCents: number }) {
  const body = b.accepted
    ? `<p>Votre justificatif a été accepté : la réservation est annulée sans frais.</p>${b.refundedCents > 0 ? `<p>Un remboursement de <strong>${euro(b.refundedCents)}</strong> a été émis sur votre moyen de paiement (délai bancaire : quelques jours ouvrés).</p>` : ""}`
    : `<p>Nous n'avons pas pu valider le justificatif envoyé (document illisible ou ne correspondant pas au trajet). Votre réservation reste confirmée. Répondez à cet e-mail ou contactez-nous pour en envoyer un autre.</p>`;
  await send(b.email, `${b.accepted ? "Annulation acceptée" : "Justificatif non validé"} — ${SITE.name}`,
    `<div style="font-family:system-ui;max-width:560px"><h2>${b.accepted ? "Annulation sans frais acceptée" : "Justificatif non validé"}</h2><p>Bonjour ${esc(b.name)},</p><p>${esc(b.trip)}</p>${body}<p>Référence : <code>${esc(b.id.slice(0, 8))}</code></p></div>`);
}
