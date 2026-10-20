export function EmBreve({ titulo }: { titulo: string }) {
  return (
    <section className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
      <h1
        className="text-ink"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', lineHeight: '32px' }}
      >
        {titulo}
      </h1>
      <p className="text-ink-muted">Chega na próxima fase.</p>
    </section>
  );
}
