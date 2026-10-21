"use client";
export default function PrintButton() {
  return <button type="button" className="btn small" onClick={() => window.print()}>Imprimer / enregistrer en PDF</button>;
}
