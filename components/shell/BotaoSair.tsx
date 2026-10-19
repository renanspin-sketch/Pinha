import { sair } from '@/lib/actions/auth';

export function BotaoSair({ className = '' }: { className?: string }) {
  return (
    <form action={sair} className={`flex flex-col ${className}`}>
      <button
        type="submit"
        className="rounded-md border border-line-strong bg-surface-raised px-4 text-ink"
        style={{ minHeight: '44px', fontWeight: 700, fontSize: '14px' }}
      >
        Sair
      </button>
    </form>
  );
}
