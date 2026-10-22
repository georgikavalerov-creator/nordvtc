import Link from "next/link";
import TripCard from "@/components/TripCard";
import HideTrip from "@/components/HideTrip";
import RestoreTrip from "@/components/RestoreTrip";
import { hiddenBookings, requireUser, userBookings } from "@/lib/account";

export const metadata = { title: "Mes trajets" };
type Props = { searchParams: Promise<{ v?: string }> };

export default async function Trajets({ searchParams }: Props) {
  const { v = "avenir" } = await searchParams;
  const user = await requireUser("/compte/trajets");
  const [list, trash] = await Promise.all([userBookings(user), hiddenBookings(user)]);
  const now = Date.now();
  const groups = {
    avenir: list.filter((b) => new Date(b.pickup_at).getTime() >= now && b.status !== "cancelled").reverse(),
    passes: list.filter((b) => new Date(b.pickup_at).getTime() < now && b.status !== "cancelled"),
    annules: list.filter((b) => b.status === "cancelled"),
    corbeille: trash,
  };
  const tabs = [["avenir", "À venir"], ["passes", "Passés"], ["annules", "Annulés"], ["corbeille", "Corbeille"]] as const;
  const key = (v in groups ? v : "avenir") as keyof typeof groups;
  const items = groups[key];
  const booked = key === "avenir" && items.some((b) => b.status === "confirmed");
  return (
    <>
      <div className="acc-headline">
        <h1 className="acc-title">Mes trajets</h1>
        <p className="muted acc-lead">Vos réservations, leurs documents et leur suivi.</p>
      </div>
      <div className="acc-tabs" role="tablist">
        {tabs.map(([k, l]) => <Link key={k} role="tab" aria-selected={k === key} className={`${k === key ? "on" : ""}${k === "corbeille" ? " tab-trash" : ""}`} href={`/compte/trajets?v=${k}`}>{l} <span>{groups[k].length}</span></Link>)}
      </div>
      {key === "corbeille" ? (
        <div className="trash-note">
          <span className="trash-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg></span>
          <p>Les trajets supprimés restent ici. Vous pouvez les remettre dans votre espace à tout moment, avec leurs documents.</p>
          {items.length > 1 && <RestoreTrip ids={items.map((b) => b.id)} label={`Tout restaurer (${items.length})`} />}
        </div>
      ) : items.length > 1 && (
        <div className="trip-bulk"><HideTrip ids={items.map((b) => b.id)} booked={booked} label={`Tout supprimer (${items.length})`} confirmText={`Supprimer ces ${items.length} trajets de votre espace ? Ils iront dans la corbeille.`} /></div>
      )}
      {items.length ? items.map((b) => <TripCard key={b.id} b={b} rebook={key === "passes" || key === "annules"} trash={key === "corbeille"} />) : (
        <p className="muted acc-none">{key === "corbeille" ? "La corbeille est vide." : "Rien à afficher ici pour le moment."}</p>
      )}
    </>
  );
}
