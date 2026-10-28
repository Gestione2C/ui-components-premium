import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/glowing-effect";
import { S, areaCls, areaOf, getWKs, ownerIdOf, G } from "../engine/state";
import { setWK } from "../engine/actions";
import { AREA_DEFAULT, P } from "../theme";
import { PRIO_COLORS, PRIO_LABELS } from "../engine/constants";
import type { Row } from "../engine/types";
import { useS } from "./useS";
import { AnimatedValue } from "./AnimatedValue";

export const FIELD = "cm-field";

/** Card con bordo luminoso al passaggio del mouse (GlowingEffect di ui-components-premium). */
export function Card({
  title,
  right,
  children,
  className,
  bodyClass,
  glow = true,
  id,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClass?: string;
  glow?: boolean;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("cm-card relative mb-3 rounded-xl border border-cm-line bg-cm-surface", className)}
    >
      {glow && <GlowingEffect spread={34} glow disabled={false} proximity={48} inactiveZone={0.2} borderWidth={1.5} />}
      {title !== undefined && (
        <header className="flex items-center justify-between gap-3 px-4 pb-1 pt-3.5">
          <h2 className="cmmono flex items-center gap-2 font-cmmono text-[11px] font-semibold uppercase tracking-[0.08em] text-cm-accent">
            {title}
          </h2>
          {right}
        </header>
      )}
      <div className={cn("relative px-4 pb-4 pt-2", bodyClass)}>{children}</div>
    </motion.section>
  );
}

const KPI_ITEM = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any } } };

export function Kpi({
  label,
  value,
  sub,
  color = P.accent,
  tone,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  color?: string;
  tone?: "pos" | "neg";
}) {
  return (
    <motion.div
      variants={KPI_ITEM}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="relative overflow-hidden rounded-xl border border-cm-line bg-cm-surface p-3.5"
      style={{ ["--kc" as any]: color }}
    >
      <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: color }} />
      <GlowingEffect spread={30} glow disabled={false} proximity={40} inactiveZone={0.3} borderWidth={1.5} />
      <div className="relative">
        <div className="mb-1.5 font-cmmono text-[10.5px] uppercase tracking-[0.08em] text-cm-muted">{label}</div>
        <div className="num mb-1 text-[26px] font-semibold leading-none" style={{ color }}>
          <AnimatedValue value={value} />
        </div>
        <div className={cn("text-[11px] leading-snug text-cm-faint", tone === "pos" && "!text-cm-ok", tone === "neg" && "!text-cm-bad")}>
          {sub || " "}
        </div>
      </div>
    </motion.div>
  );
}
/** Griglia KPI: le tessere entrano una dopo l'altra. */
export const KpiGrid = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{ show: { transition: { staggerChildren: 0.05 } } }}
    className={cn("mb-4 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5", className)}
  >
    {children}
  </motion.div>
);

/** Variazione rispetto alla settimana precedente (pos = verde, neg = rosso). */
export function Delta({ cur, old, inv = false, prev }: { cur: number; old?: number | null; inv?: boolean; prev?: string }) {
  if (!old) return null;
  const d = cur - old;
  const tone = d === 0 ? undefined : d < 0 !== inv ? "pos" : "neg";
  return (
    <span className={cn(tone === "pos" && "text-cm-ok", tone === "neg" && "text-cm-bad")}>
      {d > 0 ? "+" : ""}
      {d} vs {prev}
    </span>
  );
}

const BADGE: Record<string, string> = {
  ok: "bg-cm-ok/10 text-cm-ok border-cm-ok/25",
  warn: "bg-cm-warn/10 text-cm-warn border-cm-warn/25",
  danger: "bg-cm-bad/10 text-cm-bad border-cm-bad/25",
  info: "bg-cm-info/10 text-cm-info border-cm-info/25",
  neu: "bg-cm-muted/10 text-cm-muted border-cm-line2",
  block: "bg-[#ff1744]/15 text-[#ff8da1] border-[#ff1744]/40 font-bold",
  mut: "bg-white/[0.07] text-cm-muted border-transparent",
};
export function Badge({ kind = "neu", children, className }: { kind?: keyof typeof BADGE; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "cmmono inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-cmmono text-[10.5px] font-semibold tracking-wide",
        BADGE[kind],
        className,
      )}
    >
      {children}
    </span>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "p" | "s" | "d" | "g"; size?: "sm" | "md" };
export const Btn = React.forwardRef<HTMLButtonElement, BtnProps>(function Btn({ variant = "s", size = "md", className, ...p }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      {...p}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border font-cmmono font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
        variant === "p" && "border-transparent bg-cm-accent text-[#04222a] hover:bg-[#67e8f9]",
        variant === "s" && "border-cm-line2 bg-cm-surface2 text-cm-muted hover:border-cm-accent hover:text-cm-accent",
        variant === "d" && "border-cm-bad/30 bg-cm-bad/10 text-cm-bad hover:bg-cm-bad/20",
        variant === "g" && "border-transparent bg-transparent text-cm-muted hover:text-cm-accent",
        className,
      )}
    />
  );
});

export function PageHeader({ icon, title, desc, right }: { icon?: React.ReactNode; title: string; desc?: string; right?: React.ReactNode }) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
          {icon && <span className="text-cm-accent">{icon}</span>}
          {title}
        </h1>
        {right}
      </div>
      {desc && <p className="no-print mb-4 max-w-[900px] text-[13px] text-cm-faint">{desc}</p>}
    </>
  );
}

/** Selettore settimana (WK) condiviso da più pagine. */
export function WkBar({ className }: { className?: string }) {
  useS();
  return (
    <div className={cn("no-print flex flex-wrap gap-1.5", className)} role="group" aria-label="Settimana">
      {getWKs().map((w) => (
        <button
          key={w}
          type="button"
          aria-pressed={w === S.wk}
          onClick={() => setWK(w)}
          className={cn(
            "cmmono cursor-pointer rounded-lg border px-2.5 py-1 font-cmmono text-[11px] font-semibold transition-colors duration-150",
            w === S.wk
              ? "border-cm-accent bg-cm-accent/10 text-cm-accent"
              : "border-cm-line2 bg-cm-surface2 text-cm-muted hover:border-cm-accent hover:text-cm-accent",
          )}
        >
          {w}
        </button>
      ))}
    </div>
  );
}

export function Legend({ items, className }: { items: { color: string; label: React.ReactNode }[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {items.map((it, i) => (
        <span key={i} className="cmmono flex items-center gap-1.5 font-cmmono text-[10.5px] normal-case tracking-normal text-cm-muted">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function Pbar({ value, color }: { value: number; color: string }) {
  return (
    <div className="mb-1 h-2 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={Math.round(Math.min(100, value))} aria-valuemin={0} aria-valuemax={100}>
      <motion.i
        className="block h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: Math.min(100, value) + "%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export const Hint = ({ children }: { children: React.ReactNode }) => <p className="px-1 pb-2 text-[11.5px] text-cm-faint">{children}</p>;
export const Note = ({ children }: { children: React.ReactNode }) => <p className="pt-2 text-[11px] leading-relaxed text-cm-faint">{children}</p>;
export const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-3 text-[12.5px] text-cm-faint">{children}</div>
);

/** Banner evidenziato ("hl"): numero grande + testo */
export function Highlight({ big, color, children }: { big: React.ReactNode; color?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center gap-4 rounded-xl border border-cm-line border-l-4 border-l-cm-accent bg-gradient-to-r from-cm-accent/[0.07] to-transparent px-4 py-3.5 text-[13px] leading-snug">
      <div className="num whitespace-nowrap text-[28px] font-bold" style={{ color: color || undefined }}>
        {big}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Details({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group mb-3.5 rounded-xl border border-cm-line bg-cm-surface">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[12.5px] text-cm-accent [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90">▸</span>
        {summary}
      </summary>
      <div className="px-4 pb-3.5 text-[12.5px] leading-[1.7] text-cm-muted">{children}</div>
    </details>
  );
}

/** Contenitore tabella con scroll orizzontale (mobile) */
export const TblBox = ({ children, className, max }: { children: React.ReactNode; className?: string; max?: number }) => (
  <div className={cn("overflow-x-auto", className)} style={max ? { maxHeight: max, overflowY: "auto" } : undefined}>
    {children}
  </div>
);
export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <table className={cn("cm-table", className)}>{children}</table>
);
export function Th({
  children,
  sort,
  onSort,
  active,
  asc,
  className,
}: {
  children?: React.ReactNode;
  sort?: boolean;
  onSort?: () => void;
  active?: boolean;
  asc?: boolean;
  className?: string;
}) {
  if (!sort) return <th className={className}>{children}</th>;
  return (
    <th
      className={cn("sortable", active && "!text-cm-ink", className)}
      onClick={onSort}
      aria-sort={active ? (asc ? "ascending" : "descending") : "none"}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort?.()}
    >
      {children} <span className="opacity-40">{active ? (asc ? "↑" : "↓") : "↕"}</span>
    </th>
  );
}

export function Stat({ children }: { children: React.ReactNode }) {
  return (
    <div className="cmmono flex items-center gap-1.5 rounded-full border border-cm-line bg-cm-surface2 px-3 py-1 font-cmmono text-[11.5px] text-cm-muted [&_strong]:text-cm-ink">
      {children}
    </div>
  );
}

// ── area / owner / priorità ──
export function areaColor(a: string): string | null {
  if (!S.cfg.areas.includes(a)) return null;
  return (S.cfg.areaColors || {})[a] || AREA_DEFAULT[a] || P.accent;
}
export function AreaChip({ area, auto, small, title }: { area: string; auto?: boolean; small?: boolean; title?: string }) {
  const c = areaColor(area);
  const style: React.CSSProperties = c
    ? { background: c + "26", color: c, borderColor: c + "66" }
    : { background: "rgba(115,132,163,.12)", color: P.tick, borderColor: "var(--cm-line)" };
  return (
    <span
      className={cn(
        "cmmono inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-cmmono font-semibold",
        small ? "text-[9.5px]" : "text-[10.5px]",
        auto && "border-dashed opacity-80",
        areaCls(area),
      )}
      style={style}
      title={title}
    >
      {area}
      {auto && <span className="text-[8px] font-normal opacity-80">auto</span>}
    </span>
  );
}
/** Chip area di una commessa: manuale o suggerita (auto). */
export function RowArea({ r, small }: { r: Row; small?: boolean }) {
  const a = areaOf(r);
  if (!a) return <span className="text-cm-faint">—</span>;
  const auto = !G(r.n).area;
  return (
    <AreaChip
      area={a}
      auto={auto}
      small={small}
      title={auto ? "Suggerita da colore/commento: puoi cambiarla dalla scheda commessa" : "Assegnata a mano"}
    />
  );
}

export function OwnerAvatar({ id, size = 22, text }: { id: string; size?: number; text?: number }) {
  const o = S.cfg.owners.find((x) => x.id === id);
  if (!o) return <span className="text-cm-faint">—</span>;
  return (
    <span
      className="cmmono inline-flex shrink-0 items-center justify-center rounded-full border font-cmmono font-bold"
      style={{ width: size, height: size, fontSize: text || Math.round(size * 0.4), background: o.color + "20", color: o.color, borderColor: o.color + "40" }}
      title={o.name}
    >
      {o.id}
    </span>
  );
}
export const RowOwner = ({ r, size }: { r: Row; size?: number }) => <OwnerAvatar id={ownerIdOf(r)} size={size} />;

export function PrioTag({ prio }: { prio?: number }) {
  const p = prio || 5;
  const c = PRIO_COLORS[p];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: c }} />
      <span className="text-[10.5px]" style={{ color: c }}>
        {PRIO_LABELS[p] || "—"}
      </span>
    </span>
  );
}

/** Colore del numero di giorni di ritardo (stessa logica del vecchio analizzatore). */
export const ritColor = (r: Row) => (r.ritardo > 0 ? P.bad : r.ritardo === 0 ? P.ok : P.orange);

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  id,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  id: string;
}) {
  return (
    <div className="no-print mb-3.5 flex gap-1 border-b border-cm-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={t.value === value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            "relative cursor-pointer px-3.5 py-2 font-cmmono text-xs font-medium transition-colors duration-150",
            t.value === value ? "text-cm-accent" : "text-cm-faint hover:text-cm-ink",
          )}
        >
          {t.label}
          {t.value === value && <motion.span layoutId={"tab-" + id} className="absolute inset-x-0 -bottom-px h-0.5 bg-cm-accent" />}
        </button>
      ))}
    </div>
  );
}
