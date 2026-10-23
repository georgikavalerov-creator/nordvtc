export default function Loading() {
  return (
    <section className="section" aria-busy="true" aria-label="Chargement" style={{ minHeight: "100svh" }}>
      <div className="wrap" style={{ display: "grid", gap: 14, maxWidth: 720 }}>
        <span className="skel" style={{ width: 160 }}><i /></span>
        <span className="skel" style={{ width: "80%" }}><i style={{ height: 38 }} /></span>
        <span className="skel" style={{ width: "100%" }}><i style={{ height: 120 }} /></span>
      </div>
    </section>
  );
}
