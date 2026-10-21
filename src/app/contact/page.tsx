import type { Metadata } from "next";
import CallGate from "@/components/CallGate";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact et devis chauffeur privé à Lille",
  description: "Contactez Nord VTC pour un devis, un mariage, une mise à disposition ou une demande particulière.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ sujet?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const email = (await getSiteSettings()).email || SITE.email;
  const { sujet = "" } = await searchParams;
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h1>Parlons de votre trajet</h1>
          <p className="muted prose">Devis pour un mariage, une mise à disposition ou un compte entreprise : écrivez-nous, nous répondons rapidement.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap" style={{ marginBottom: 32 }}><CallGate /></div>
        <div className="wrap grid cols-2" style={{ gap: 48, alignItems: "start" }}>
          <div className="ticket">
            <ContactForm initialSubject={sujet.slice(0, 120)} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.4rem" }}>Nous joindre</h2>
            <ul className="contact-list">
              <li><Icon name="phone" size={18} /> Téléphone : <a href="#appel">afficher le numéro</a></li>
              {email && (
                <li>
                  <Icon name="mail" size={18} /> E-mail : <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              <li><Icon name="pin" size={18} /> Zone : {SITE.area}</li>
              <li><Icon name="clock" size={18} /> Service sur réservation</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
