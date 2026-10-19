import type { CSSProperties } from "react";

export type LogoVariant = "horizontal" | "assinatura" | "invertido";

const MARK_SIZE = 40;

export function Logo({ variant = "horizontal" }: { variant?: LogoVariant }) {
  const invertido = variant === "invertido";

  const wordmark: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "40px",
    lineHeight: "40px",
    letterSpacing: "-0.03em",
    color: invertido ? "var(--on-brand-deep)" : "var(--brand-deep)",
  };
  const signature: CSSProperties = {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    color: invertido ? "var(--on-brand-deep-muted)" : "var(--ink-muted)",
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={invertido ? "/icons/pinha-mark-branca.svg" : "/pinha-mark.svg"}
          alt=""
          width={MARK_SIZE}
          height={MARK_SIZE}
        />
        <span style={wordmark}>pinha</span>
      </div>
      {variant === "assinatura" && <span style={signature}>by PINDev</span>}
    </div>
  );
}
