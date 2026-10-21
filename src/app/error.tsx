"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 560, textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem" }}>Un souci est survenu</h1>
        <p className="muted">Rien n'a été perdu. Réessayez, ou appelez-nous si c'est urgent.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={reset}>Réessayer</button>
          <a className="btn ghost" href="/contact#appel">Être rappelé</a>
        </div>
      </div>
    </section>
  );
}
