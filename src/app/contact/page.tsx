import type { Metadata } from "next";
import { Crumb } from "@/components/JsonLd";
import CallGate from "@/components/CallGate";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import RatingBadge from "@/components/RatingBadge";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact et devis chauffeur privé à Lille",
  description: "Contactez Nord VTC, chauffeur privé à Lille : devis, mariage, mise à disposition, compte entreprise. Réponse du chauffeur, par e-mail ou téléphone.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ sujet?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const email = (await getSiteSettings()).email || SITE.email;
  const { sujet = "" } = await searchParams;
  return (
    <>
      <Crumb name="Contact" path="/contact" />
      <section className="page-hero ct-hero">
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h1>Parlons de votre trajet</h1>
          <p className="muted prose">Une question, un devis pour un mariage, une mise à disposition ou un compte entreprise : vous échangez directement avec le chauffeur.</p>
          <div className="ct-quick">
            <a href="#appel" className="ct-q"><span className="ct-q-ico"><Icon name="phone" size={22} /></span><span><strong>Appeler ou être rappelé</strong><small>Numéro affiché en quelques secondes</small></span></a>
            <a href="#message" className="ct-q"><span className="ct-q-ico"><Icon name="chat" size={22} /></span><span><strong>Écrire un message</strong><small>Devis, demande particulière</small></span></a>
            {email && <a href={`mailto:${email}`} className="ct-q"><span className="ct-q-ico"><Icon name="mail" size={22} /></span><span><strong>Par e-mail</strong><small>{email}</small></span></a>}
          </div>
        </div>
      </section>

      <section className="section ct-sec">
        <div className="wrap ct-grid">
          <div className="ct-col">
            <div className="ct-card" id="appel"><CallGate /></div>
            <aside className="ct-who">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/chauffeur-avatar-manga.webp" alt="" width={64} height={64} className="ct-avatar" loading="lazy" />
              <div>
                <strong>Georgi, votre interlocuteur</strong>
                <p className="muted">Chauffeur indépendant installé à Lesquin. C&apos;est lui qui vous répond, et lui qui conduit.</p>
                <RatingBadge className="ct-rating" />
              </div>
            </aside>
          </div>
          <div className="ct-card ct-form" id="message">
            <h2>Écrire un message</h2>
            <p className="muted ct-sub">Réponse par e-mail ou par téléphone, selon votre préférence.</p>
            <ContactForm initialSubject={sujet.slice(0, 120)} />
          </div>
        </div>
        <div className="wrap">
          <ul className="ct-info">
            <li><Icon name="pin" size={20} /><span><strong>Zone</strong>{SITE.area}</span></li>
            <li><Icon name="clock" size={20} /><span><strong>Disponibilité</strong>Courses de jour comme de nuit, sur réservation</span></li>
            <li><Icon name="briefcase" size={20} /><span><strong>Entreprises</strong>Facture au nom de la société, bon de commande</span></li>
          </ul>
        </div>
      </section>
    </>
  );
}
