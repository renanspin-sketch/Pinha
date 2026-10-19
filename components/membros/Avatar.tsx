export function Avatar({ nome, cor }: { nome: string; cor: number }) {
  const par =
    cor === 1
      ? { bg: 'var(--person-1)', fg: 'var(--on-person-1)' }
      : cor === 2
        ? { bg: 'var(--person-2)', fg: 'var(--on-person-2)' }
        : { bg: 'var(--ink-muted)', fg: 'var(--on-brand)' };
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-pill"
      style={{ width: '40px', height: '40px', background: par.bg, color: par.fg, fontWeight: 800, fontSize: '16px' }}
    >
      {nome.trim().charAt(0).toUpperCase()}
    </span>
  );
}
