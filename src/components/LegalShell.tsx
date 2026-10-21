export default function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>{title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="wrap prose">{children}</div>
      </section>
    </>
  );
}
