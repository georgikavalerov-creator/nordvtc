import { Resend } from "resend";
import { SITE } from "./site";
import { euro } from "./pricing";
import { getSiteSettings } from "./content";
import { CONTACT_EMAIL, button, buttons, esc, h2, layout, note, p, pill, priceBox, quote, rows, signature, small, toText, tripCard } from "./mail-layout";
import { CHAT_INBOX, chatTag } from "./chat-tag";

export type BookingMail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  originLabel: string;
  destLabel: string;
  pickupAtLocal: string; // déjà formaté en français
  pickupIso?: string; // pour le lien « Ajouter à mon agenda »
  durationS?: number | null;
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
const ref = (id: string) => id.slice(0, 8).toUpperCase();
const firstName = (n: string | null | undefined) => (n ?? "").trim().split(/\s+/)[0] || "";
const driverPhone = async () => (await getSiteSettings()).driverPhone || process.env.DRIVER_PHONE || "";

export async function send(to: string, subject: string, html: string, opts: { replyTo?: string } = {}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // e-mails désactivés tant que la clé n'est pas renseignée
  const resend = new Resend(key);
  // Resend renvoie { error } sans lever d'exception : on la journalise, et on retente (limite de débit, erreur passagère).
  for (let attempt = 1; attempt <= 3; attempt++) {
    const from = process.env.MAIL_FROM ?? `${SITE.name} <onboarding@resend.dev>`;
    const { error } = await resend.emails.send({ from, to, subject, html, text: toText(html), replyTo: opts.replyTo });
    if (!error) return;
    console.error(`mail:${subject}:essai ${attempt} expéditeur=${from}`, JSON.stringify(error));
    if (attempt === 3) throw new Error(`Envoi e-mail impossible : ${error.message}`);
    await sleep(900 * attempt);
  }
}

/** Lien Google Agenda (les autres agendas acceptent le fichier .ics du suivi). */
function calendarUrl(b: BookingMail) {
  if (!b.pickupIso) return null;
  const start = new Date(b.pickupIso);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + Math.max(1800, b.durationS ?? 3600) * 1000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({ action: "TEMPLATE", text: `${SITE.name} — ${b.originLabel} → ${b.destLabel}`, dates: `${f(start)}/${f(end)}`, details: `Réservation ${ref(b.id)}${b.trackUrl ? `\n${b.trackUrl}` : ""}`, location: b.originLabel });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const tripRows = (b: BookingMail) => rows([
  ["Passagers", String(b.passengers)],
  ["Bagages", String(b.luggage)],
  b.childSeat && ["Siège enfant", "Demandé"],
  b.flight && ["Vol / train", esc(b.flight)],
  ["Référence", ref(b.id)],
]);

export async function sendBookingEmails(b: BookingMail) {
  const rest = Math.max(0, b.priceCents - b.paidCents);
  const phone = await driverPhone();
  const cal = calendarUrl(b);
  const prices: [string, string][] = [["Prix du trajet", euro(b.priceCents)], ["Réglé en ligne", euro(b.paidCents)], [rest > 0 ? "Reste à régler à bord" : "Reste à régler", euro(rest)]];
  let customerError: unknown = null;
  try {
    await send(b.email, `Réservation confirmée · ${b.pickupAtLocal}`, layout({
      preheader: `${b.originLabel} → ${b.destLabel}, ${b.pickupAtLocal}. Votre chauffeur sera là à l'heure.`,
      badge: pill("Réservation confirmée", "green"),
      title: `Merci ${firstName(b.name)}, c'est réservé`,
      body:
        p("Votre course est confirmée. Je serai sur place avant l'heure convenue ; vous recevrez mes coordonnées et je vous préviendrai de mon arrivée.") +
        tripCard(b.originLabel, b.destLabel, b.pickupAtLocal) +
        tripRows(b) +
        h2("Paiement") + priceBox(prices) +
        (rest > 0 ? small("Le solde se règle à bord, par carte ou en espèces.") : "") +
        buttons(
          b.trackUrl ? button(b.trackUrl, "Suivre ma réservation") : "",
          cal ? button(cal, "Ajouter à mon agenda", "light") : "",
          b.orderUrl ? button(b.orderUrl, "Bon de commande", "light") : "",
        ) +
        note(`Le lien « Suivre ma réservation » fonctionne sans compte : gardez cet e-mail. Il permet aussi de modifier une adresse ou d'annuler selon les <a href="${SITE.url}/cgv" style="color:inherit">conditions</a>.`, "grey") +
        p(`Besoin de changer quelque chose ? Répondez à cet e-mail${phone ? ` ou appelez le <a href="tel:${esc(phone.replace(/\s/g, ""))}" style="color:#0b0b0c;font-weight:700;text-decoration:none">${esc(phone)}</a>` : ""}.`) +
        signature(phone),
    }), { replyTo: CONTACT_EMAIL });
  } catch (e) { customerError = e; } // la notification au chauffeur part quand même
  const notify = process.env.MAIL_NOTIFY_TO;
  if (notify) {
    await sleep(700);
    await send(notify, `Nouvelle course · ${b.pickupAtLocal} · ${b.originLabel} → ${b.destLabel}`, layout({
      audience: "admin",
      preheader: `${b.name} · ${euro(b.priceCents)} · ${b.pickupAtLocal}`,
      badge: pill("Nouvelle réservation payée", "green"),
      title: b.name,
      body:
        rows([
          ["Téléphone", `<a href="tel:${esc(b.phone.replace(/\s/g, ""))}" style="color:#0b0b0c;text-decoration:none">${esc(b.phone)}</a>`],
          ["E-mail", `<a href="mailto:${esc(b.email)}" style="color:#0b0b0c;text-decoration:none">${esc(b.email)}</a>`],
        ]) +
        tripCard(b.originLabel, b.destLabel, b.pickupAtLocal) +
        tripRows(b) +
        (b.notes ? quote(b.notes, "Note du client") : "") +
        priceBox(prices) +
        buttons(
          button(`${SITE.url}/admin/reservations`, "Ouvrir dans l'administration", "dark"),
          button(`${SITE.url}/admin/ics/${b.id}`, "Ajouter à l'agenda", "light"),
          button(`tel:${b.phone.replace(/\s/g, "")}`, "Appeler", "light"),
        ),
    }), { replyTo: b.email });
  }
  if (customerError) throw customerError;
}

export async function sendCancellationEmails(b: { id: string; name: string; email: string; originLabel: string; destLabel: string; pickupAtLocal: string; refundedCents: number; keptCents: number }) {
  const money = [
    b.keptCents > 0 && note(`L'annulation intervient moins de 24 h avant la prise en charge : ${euro(b.keptCents)} restent acquis (montant de l'acompte), conformément aux <a href="${SITE.url}/cgv" style="color:inherit">conditions générales de vente</a>.`, "amber"),
    b.refundedCents > 0 && priceBox([["Remboursement émis", euro(b.refundedCents)]]) + small("Le montant apparaîtra sur votre moyen de paiement sous quelques jours ouvrés, selon votre banque."),
  ].filter(Boolean).join("");
  await send(b.email, `Réservation annulée · ${b.pickupAtLocal}`, layout({
    preheader: b.refundedCents > 0 ? `Remboursement de ${euro(b.refundedCents)} en cours.` : `Votre course du ${b.pickupAtLocal} est annulée.`,
    badge: pill("Réservation annulée", "red"),
    title: "Votre réservation est annulée",
    body:
      p(`Bonjour ${esc(firstName(b.name))}, votre annulation a bien été prise en compte.`) +
      tripCard(b.originLabel, b.destLabel, b.pickupAtLocal) +
      money +
      rows([["Référence", ref(b.id)]]) +
      p("Un nouveau trajet à prévoir ? Je serai ravi de vous conduire.") +
      buttons(button(`${SITE.url}/reservation`, "Réserver un trajet", "light")),
  }), { replyTo: CONTACT_EMAIL });
  const notify = process.env.MAIL_NOTIFY_TO;
  if (notify) await send(notify, `Annulation · ${b.pickupAtLocal} · ${b.name}`, layout({
    audience: "admin",
    preheader: `Remboursé ${euro(b.refundedCents)} · conservé ${euro(b.keptCents)}`,
    badge: pill("Annulation par le client", "red"),
    title: b.name,
    body:
      tripCard(b.originLabel, b.destLabel, b.pickupAtLocal) +
      rows([["E-mail", esc(b.email)], ["Remboursé", euro(b.refundedCents)], ["Conservé", euro(b.keptCents)], ["Référence", esc(b.id)]]) +
      buttons(button(`${SITE.url}/admin/reservations`, "Voir les réservations", "dark")),
  }), { replyTo: b.email });
}

export async function sendInvoiceEmail(b: { name: string; email: string; number: string; url: string }) {
  await send(b.email, `Votre facture ${b.number} · ${SITE.name}`, layout({
    preheader: `Facture n° ${b.number} disponible en ligne (imprimable et PDF).`,
    badge: pill("Facture", "grey"),
    title: "Merci pour ce trajet",
    body:
      p(`Bonjour ${esc(firstName(b.name))}, c'était un plaisir de vous conduire. Votre facture est disponible en ligne.`) +
      rows([["Facture n°", esc(b.number)]]) +
      buttons(button(b.url, "Ouvrir la facture")) +
      small("Depuis la facture, utilisez « Imprimer » puis « Enregistrer en PDF » pour la conserver.") +
      note(`Satisfait du trajet ? Un avis Google m'aide énormément. Et pour vos prochains déplacements : <a href="${SITE.url}/reservation" style="color:inherit;font-weight:700">réserver en une minute</a>.`, "blue") +
      signature(),
  }), { replyTo: CONTACT_EMAIL });
}

// ---------- Annulation sur justificatif (train ou vol annulé) ----------
export async function sendClaimReceived(b: { id: string; name: string; email: string; trip: string; kind: string; fileUrl: string; note: string | null }) {
  await send(b.email, `Justificatif reçu · ${SITE.name}`, layout({
    preheader: "Votre demande d'annulation sans frais est en cours de vérification.",
    badge: pill("En cours de vérification", "amber"),
    title: "Justificatif bien reçu",
    body:
      p(`Bonjour ${esc(firstName(b.name))}, votre demande d'annulation sans frais (${esc(b.kind)} annulé) est en cours de vérification.`) +
      rows([["Trajet", esc(b.trip)], ["Référence", ref(b.id)]]) +
      note("Vous recevrez un e-mail dès qu'elle sera traitée. En cas d'accord, la totalité de la somme payée vous sera remboursée.", "grey"),
  }), { replyTo: CONTACT_EMAIL });
  const notify = process.env.MAIL_NOTIFY_TO;
  if (notify) await send(notify, `Justificatif à vérifier · ${b.kind} annulé · ${b.name}`, layout({
    audience: "admin",
    preheader: b.trip,
    badge: pill("Justificatif à vérifier", "amber"),
    title: b.name,
    body:
      rows([["E-mail", esc(b.email)], ["Motif", `${esc(b.kind)} annulé`], ["Trajet", esc(b.trip)], ["Référence", esc(b.id)]]) +
      (b.note ? quote(b.note, "Message du client") : "") +
      buttons(button(b.fileUrl, "Voir le justificatif"), button(`${SITE.url}/admin/reservations`, "Accepter ou refuser", "dark")) +
      small("Le lien du justificatif est valable 7 jours."),
  }), { replyTo: b.email });
}

export async function sendClaimDecision(b: { id: string; name: string; email: string; trip: string; accepted: boolean; refundedCents: number }) {
  const body = b.accepted
    ? p("Votre justificatif a été accepté : la réservation est annulée sans frais.") +
      (b.refundedCents > 0 ? priceBox([["Remboursement émis", euro(b.refundedCents)]]) + small("Délai bancaire : quelques jours ouvrés.") : "")
    : p("Je n'ai pas pu valider le justificatif envoyé (document illisible ou ne correspondant pas au trajet). Votre réservation reste confirmée.") +
      note("Répondez simplement à cet e-mail avec un autre document : je le vérifierai rapidement.", "amber");
  await send(b.email, `${b.accepted ? "Annulation acceptée" : "Justificatif non validé"} · ${SITE.name}`, layout({
    preheader: b.accepted ? "Annulation sans frais acceptée." : "Votre réservation reste confirmée.",
    badge: pill(b.accepted ? "Annulation acceptée" : "Justificatif non validé", b.accepted ? "green" : "amber"),
    title: b.accepted ? "Annulation sans frais acceptée" : "Justificatif non validé",
    body: p(`Bonjour ${esc(firstName(b.name))},`) + rows([["Trajet", esc(b.trip)], ["Référence", ref(b.id)]]) + body + signature(),
  }), { replyTo: CONTACT_EMAIL });
}

// ---------- Discussion en direct ----------
// Les deux e-mails ont pour adresse de réponse chat@nordvtc.fr avec un repère dans l'objet :
// répondre depuis sa messagerie publie directement le message dans la discussion.
export async function sendChatNotice(m: { threadId: string; name: string | null; email: string | null; page: string | null; body: string; url: string }) {
  const notify = process.env.MAIL_NOTIFY_TO;
  if (!notify) return;
  const who = m.name || "Un visiteur";
  await send(notify, `${who} vous écrit sur le site · ${chatTag(m.threadId)}`, layout({
    audience: "admin",
    preheader: m.body.slice(0, 120),
    badge: pill("Nouveau message", "blue"),
    title: `${who} vous a écrit`,
    body:
      quote(m.body, m.name || "Visiteur") +
      note("<strong>Répondez simplement à cet e-mail</strong> : votre réponse s'affiche aussitôt dans la discussion du client (et lui est envoyée par e-mail s'il a quitté le site).", "blue") +
      rows([
        ["Contact", m.email ? `<a href="mailto:${esc(m.email)}" style="color:#0b0b0c;text-decoration:none">${esc(m.email)}</a>` : "Pas d'e-mail laissé"],
        m.page && ["Page", esc(m.page)],
      ]) +
      buttons(button(m.url, "Ouvrir la discussion", "dark")) +
      small("Écrivez au-dessus du message d'origine ; la partie citée est ignorée automatiquement."),
  }), { replyTo: CHAT_INBOX });
}

export async function sendChatReplyNotice(m: { threadId: string; email: string; name: string | null; body: string; url: string }) {
  await send(m.email, `Georgi vous a répondu · ${chatTag(m.threadId)}`, layout({
    preheader: m.body.slice(0, 120),
    badge: pill("Nouvelle réponse", "blue"),
    title: `Bonjour${m.name ? ` ${firstName(m.name)}` : ""}, vous avez une réponse`,
    body:
      quote(m.body, "Georgi, votre chauffeur") +
      buttons(button(m.url, "Reprendre la discussion")) +
      small("Vous pouvez aussi répondre directement à cet e-mail : votre message arrivera dans la discussion.") +
      signature() +
      small(`Vous recevez cet e-mail car vous avez laissé votre adresse dans la discussion du site ${esc(SITE.name)}.`),
  }), { replyTo: CHAT_INBOX });
}

// ---------- Formulaire de contact et demande de rappel ----------
export async function sendContactNotice(d: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  const to = process.env.MAIL_NOTIFY_TO;
  if (!to) throw new Error("MAIL_NOTIFY_TO manquant");
  await send(to, `Contact · ${d.subject || "demande"} · ${d.name}`, layout({
    audience: "admin",
    preheader: d.message.slice(0, 120),
    badge: pill("Formulaire de contact", "blue"),
    title: d.name,
    body:
      quote(d.message, d.subject || "Message") +
      rows([["E-mail", `<a href="mailto:${esc(d.email)}" style="color:#0b0b0c;text-decoration:none">${esc(d.email)}</a>`], d.phone && ["Téléphone", `<a href="tel:${esc(d.phone.replace(/\s/g, ""))}" style="color:#0b0b0c;text-decoration:none">${esc(d.phone)}</a>`]]) +
      note("Répondez à cet e-mail : la réponse part directement au client.", "grey"),
  }), { replyTo: d.email });
}

export async function sendCallbackNotice(l: { name: string; phone: string; need?: string; verified: boolean }) {
  const to = process.env.MAIL_NOTIFY_TO;
  if (!to) return;
  await send(to, `À rappeler · ${l.name} · ${l.phone}${l.verified ? " (vérifié)" : ""}`, layout({
    audience: "admin",
    preheader: `${l.phone}${l.need ? ` · ${l.need}` : ""}`,
    badge: pill(l.verified ? "Numéro vérifié par SMS" : "Demande de rappel", l.verified ? "green" : "amber"),
    title: `Rappeler ${l.name}`,
    body:
      (l.need ? quote(l.need, "Besoin") : "") +
      buttons(button(`tel:${l.phone.replace(/\s/g, "")}`, `Appeler le ${l.phone}`, "dark")),
  }));
}
