import Link from "next/link";
// Convertit "[texte](/chemin)" en lien interne ; le reste reste du texte brut.
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\(\/[^)]*\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[([^\]]+)\]\((\/[^)]*)\)$/);
        return m ? <Link key={i} href={m[2]}>{m[1]}</Link> : <span key={i}>{p}</span>;
      })}
    </>
  );
}
