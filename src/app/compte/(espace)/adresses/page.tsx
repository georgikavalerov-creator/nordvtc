import PlacesManager from "@/components/PlacesManager";
import { getPlaces, requireUser } from "@/lib/account";

export const metadata = { title: "Adresses enregistrées" };
export default async function Adresses() {
  const user = await requireUser("/compte/adresses");
  return (
    <>
      <h1 className="acc-title">Adresses enregistrées</h1>
      <p className="muted">Domicile, travail ou lieux habituels : retrouvez-les en un clic au moment de réserver.</p>
      <PlacesManager places={await getPlaces(user.id)} />
    </>
  );
}
