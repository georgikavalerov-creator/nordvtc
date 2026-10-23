// Page jetable (méthode « state-machine ») : la vraie carte de trajet dans tous ses états.
// Accessible uniquement en développement. Pour la supprimer : effacer le dossier src/app/etats-dev.
import { notFound } from "next/navigation";
import Playground from "./Playground";

export const metadata = { title: "États · carte de trajet", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ __state?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { __state } = await searchParams;
  return <Playground state={__state ?? "a-venir"} />;
}
