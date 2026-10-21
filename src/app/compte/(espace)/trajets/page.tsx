import Link from "next/link";
import TripCard from "@/components/TripCard";
import { requireUser, userBookings } from "@/lib/account";

export const metadata = { title: "Mes trajets" };
type Props = { searchParams: Promise<{ v?: string }> };

export default async function Trajets({ searchParams }: Props) {
  const { v = "avenir" } = await searchParams;
  const user = await requireUser("/compte/trajets");
  const list = await userBookings(user);
  const now = Date.now();
  const groups = {
    avenir: list.filter((b) => new Date(b.pickup_at).getTime() >= now && b.status !== "cancelled").reverse(),
    passes: list.filter((b) => new Date(b.pickup_at).getTime() < now && b.status !== "cancelled"),
    annules: list.filter((b) => b.status === "cancelled"),
  };
  const tabs = [["avenir", "À venir"], ["passes", "Passés"], ["annules", "Annulés"]] as const;
  const key = (v in groups ? v : "avenir") as keyof typeof groups;
  return (
    <>
      <h1 className="acc-title">Mes trajets</h1>
      <div className="acc-tabs" role="tablist">
        {tabs.map(([k, l]) => <Link key={k} role="tab" aria-selected={k === key} className={k === key ? "on" : ""} href={`/compte/trajets?v=${k}`}>{l} <span>{groups[k].length}</span></Link>)}
      </div>
      {groups[key].length ? groups[key].map((b) => <TripCard key={b.id} b={b} rebook={key !== "avenir"} />) : <p className="muted">Rien à afficher ici pour le moment.</p>}
    </>
  );
}
