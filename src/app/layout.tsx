import type { Metadata, Viewport } from "next";
import "@fontsource-variable/figtree";
import "@fontsource/caveat/600.css";
import "./globals.css";
import ScrollFX from "@/components/ScrollFX";
import Interact from "@/components/Interact";
import MobileBar from "@/components/MobileBar";
import Gliders from "@/components/Gliders";
import AppBridge from "@/components/AppBridge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import CookieNotice from "@/components/CookieNotice";
import Analytics from "@/components/Analytics";
import CtaTracker from "@/components/CtaTracker";
import PricingFx from "@/components/PricingFx";
import { THEME_INIT } from "@/components/ThemeToggle";
import { SITE } from "@/lib/site";
import { VILLES } from "@/lib/villes";
import { IconDefs } from "@/components/Icon";
import ChatButton from "@/components/ChatButton";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "VTC Lille : chauffeur privé, aéroport et gares | Nord VTC",
    template: "%s | Nord VTC",
  },
  description:
    "VTC à Lille et dans la métropole : chauffeur privé à prix fixé, suivi de vol. Aéroport de Lille-Lesquin, gares, Paris, Bruxelles. Réservation en 1 minute.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.name,
    title: "Nord VTC — Chauffeur privé à Lille",
    description: "Prix ferme, même chauffeur, suivi de vol : transferts aéroport, gares et longues distances depuis Lille.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Nord VTC, chauffeur privé à Lille" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "TaxiService",
  name: SITE.name,
  url: SITE.url,
  description:
    "Chauffeur privé (VTC) à Lille : transferts aéroport, gares et trajets longue distance sur réservation.",
  areaServed: [
    { "@type": "City", name: "Lille" },
    ...VILLES.map((v) => ({ "@type": "City", name: v.name })),
    { "@type": "AdministrativeArea", name: "Métropole européenne de Lille" },
  ],
  image: `${SITE.url}/opengraph-image.png`,
  logo: `${SITE.url}/icon-512.png`,
  hasMap: "https://www.google.com/maps/search/?api=1&query=Nord+VTC+Lesquin",
  knowsLanguage: ["fr", "en", "bg"],
  paymentAccepted: "Carte bancaire, Apple Pay, Google Pay",
  currenciesAccepted: "EUR",
  ...(SITE.email ? { email: SITE.email } : {}),
  priceRange: "€€",
  address: { "@type": "PostalAddress", streetAddress: "2 rue Charles Devendeville", postalCode: "59810", addressLocality: "Lesquin", addressCountry: "FR" },
  geo: { "@type": "GeoCoordinates", latitude: 50.5885, longitude: 3.1034 },
  openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
  potentialAction: { "@type": "ReserveAction", target: `${SITE.url}/reservation`, name: "Réserver un trajet" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {/* Application iOS (Capacitor) : le navigateur intégré annonce « NordVTCApp » */}
        <script dangerouslySetInnerHTML={{ __html: "try{if(/NordVTCApp/.test(navigator.userAgent))document.documentElement.classList.add('in-app')}catch(e){}" }} />
      </head>
      <body>
        <a href="#contenu" className="skip">
          Aller au contenu
        </a>
        <JsonLd data={localBusiness} />
        <IconDefs />
        <Header />
        <main id="contenu">{children}</main>
        <ScrollFX />
        <Interact />
        <Footer />
        <MobileBar />
        <Gliders />
        <ChatButton />
        <Analytics />
        <CookieNotice />
        <CtaTracker />
        <AppBridge />
        <PricingFx />
      </body>
    </html>
  );
}
