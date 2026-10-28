import React, { useState } from "react";
import {
  Archive, Building2, CheckCircle2, Circle, Clock, Compass, Construction, Factory, FileText, HelpCircle, Hourglass,
  Infinity as InfinityIcon, Lightbulb, type LucideIcon, Package, PhoneOff, Printer, RotateCcw, Ruler, Settings, Siren,
  TrendingUp, TriangleAlert, User, Wrench, XCircle, Zap, ClipboardList, CalendarClock, ArrowUpRight, Pin, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACTIONS, FLOWS, type GuidaOpt, type GuidaPlan, type GuidaQuestion } from "../engine/guida-data";
import { Badge, Btn, Card } from "../ui/primitives";
import { P } from "../theme";

// ── mappa emoji dei dati → icone lucide (le emoji non vengono mostrate) ──
const EMOJI_ICON: [string, LucideIcon, string?][] = [
  ["🟡", Circle, P.warn],
  ["🟠", Circle, P.orange],
  ["🔴", Circle, P.bad],
  ["🟢", Circle, P.ok],
  ["🚨", Siren, P.bad],
  ["📦", Package],
  ["🏭", Factory],
  ["⚙", Settings],
  ["👤", User],
  ["📋", ClipboardList],
  ["🗃", Archive],
  ["🚧", Construction],
  ["🔧", Wrench],
  ["🔄", InfinityIcon],
  ["📐", Ruler],
  ["📈", TrendingUp],
  ["📄", FileText],
  ["❌", XCircle],
  ["✅", CheckCircle2],
  ["⏳", Hourglass],
  ["📵", PhoneOff],
  ["♾", InfinityIcon],
  ["⏰", Clock],
  ["❓", HelpCircle],
  ["🏢", Building2],
];
function EmojiIcon({ emoji, size = 18, className }: { emoji: string; size?: number; className?: string }) {
  const hit = EMOJI_ICON.find(([e]) => emoji.startsWith(e));
  const Ico = hit ? hit[1] : Circle;
  return <Ico size={size} className={className} color={hit?.[2]} aria-hidden="true" />;
}
// "⏰ Commessa in ritardo" → "Commessa in ritardo"
const stripEmoji = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, "");

const SEV_COLOR: Record<string, string> = {
  "var(--red)": P.bad,
  "var(--orange)": P.orange,
  "var(--green)": P.ok,
  "var(--text2)": P.tick,
};

type Scenario = { id: string; icon: LucideIcon; title: string; sub: string; badge: string; color: string; block?: boolean };
const SCENARI: Scenario[] = [
  { id: "ritardo", icon: Clock, title: "Commessa in ritardo", sub: "Scadenza superata, cliente in attesa, delivery a rischio", badge: "Priorità alta", color: P.bad },
  { id: "bloccante", icon: Construction, title: "Condizione bloccante", sub: "Materiale mancante, attesa fornitore/cliente, problema tecnico", badge: "Blocco operativo", color: P.critical, block: true },
  { id: "nodata", icon: HelpCircle, title: "Commessa senza data", sub: "Nessuna scadenza pianificata, commessa aperta da tempo", badge: "Pianificazione", color: P.orange },
  { id: "anzianita", icon: Package, title: "Commessa anziana (>90 gg)", sub: "Ordine aperto da più di 90 giorni senza avanzamento", badge: "Revisione", color: P.info },
  { id: "concentrazione", icon: Building2, title: "Concentrazione su cliente", sub: "Un singolo cliente occupa oltre il 30% del portafoglio", badge: "Rischio portfolio", color: P.accent },
  { id: "area_overload", icon: Factory, title: "Area di produzione sovraccarica", sub: "Un reparto ha troppi ordini aperti o troppi bloccanti", badge: "Capacità", color: P.ok },
];

type HistItem = { stepId: string; label: string; optId: string };
type State = {
  scenario: string | null;
  current: string;
  history: HistItem[];
  selected: GuidaOpt | null;
  checks: Record<string, boolean>;
};
const INIT: State = { scenario: null, current: "start", history: [], selected: null, checks: {} };

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cm-accent";

export default function Guida() {
  const [st, setSt] = useState<State>(INIT);
  const reset = () => setSt(INIT);
  const start = (scenario: string) => setSt({ ...INIT, scenario });

  const flow = st.scenario ? FLOWS[st.scenario] : null;
  const step = flow ? flow.steps[st.current] : null;
  const isAction = !!step && step.type === "action";

  const next = () => {
    if (!st.selected) return;
    setSt((s) => ({
      ...s,
      history: [...s.history, { stepId: s.current, label: s.selected!.title, optId: s.selected!.id }],
      current: s.selected!.next,
      selected: null,
    }));
  };
  const back = () => {
    setSt((s) => {
      if (!s.history.length || !s.scenario) return s;
      const prev = s.history[s.history.length - 1];
      const ps = FLOWS[s.scenario].steps[prev.stepId] as GuidaQuestion;
      const opt = ps.opts?.find((o) => o.id === prev.optId) || null; // ripristina la scelta fatta
      return { ...s, history: s.history.slice(0, -1), current: prev.stepId, selected: opt };
    });
  };
  const toggleCheck = (id: string) => setSt((s) => ({ ...s, checks: { ...s.checks, [id]: !s.checks[id] } }));

  return (
    <div>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
          <span className="text-cm-accent">
            <Compass size={22} />
          </span>
          Guida alle Criticità — Flusso guidato
        </h1>
        <Btn variant="s" size="sm" onClick={reset}>
          <RotateCcw size={13} aria-hidden="true" /> Ricomincia
        </Btn>
      </div>
      <p className="no-print mb-4 max-w-[900px] text-[13px] text-cm-faint">Per ogni tipo di criticità, cosa fare e in che tempi.</p>

      {!flow || !step ? (
        <Home onStart={start} />
      ) : (
        <div>
          {/* breadcrumb */}
          <nav aria-label="Percorso" className="no-print cmmono mb-4 flex flex-wrap items-center gap-1.5 font-cmmono text-[11px] text-cm-faint">
            <span>{stripEmoji(flow.label)}</span>
            {st.history.map((h, i) => (
              <React.Fragment key={i}>
                <span aria-hidden="true" className="text-[10px]">›</span>
                <span>{h.label || ""}</span>
              </React.Fragment>
            ))}
            {!isAction && (
              <>
                <span aria-hidden="true" className="text-[10px]">›</span>
                <span className="text-cm-accent" aria-current="step">{(step as GuidaQuestion).question || ""}</span>
              </>
            )}
          </nav>

          {/* progress */}
          <div className="no-print mb-5 h-[3px] overflow-hidden rounded-[3px] bg-cm-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress(step)}>
            <div className="h-full rounded-[3px] bg-cm-accent transition-[width] duration-300" style={{ width: progress(step) + "%" }} />
          </div>

          {isAction ? (
            <ActionPlan scenario={(step as any).scenario || st.scenario!} variant={(step as any).variant} checks={st.checks} onCheck={toggleCheck} onReset={reset} />
          ) : (
            <Question step={step as GuidaQuestion} selected={st.selected} onSelect={(o) => setSt((s) => ({ ...s, selected: o }))} />
          )}

          {/* nav */}
          <div className="no-print mt-5 flex flex-wrap items-center gap-2">
            {st.history.length > 0 && (
              <Btn variant="s" onClick={back}>
                ← Indietro
              </Btn>
            )}
            <Btn variant="s" onClick={reset}>
              <RotateCcw size={13} aria-hidden="true" /> Ricomincia da capo
            </Btn>
            <div className="ml-auto">
              {!isAction && st.selected && (
                <Btn variant="p" onClick={next}>
                  Avanti →
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function progress(step: { type?: string; n?: number; total?: number }) {
  return step.type === "action" ? 100 : Math.round((((step.n as number) - 1) / (step.total as number)) * 90);
}

function Home({ onStart }: { onStart: (id: string) => void }) {
  return (
    <div>
      <div className="mb-4 rounded-xl border border-cm-line bg-cm-surface p-5 font-cmmono text-xs leading-[1.8] text-cm-muted">
        Seleziona la <strong className="text-cm-accent">tipologia di criticità</strong> che stai affrontando.
        <br />
        Il sistema ti guiderà passo dopo passo con domande, azioni consigliate e checklist operative.
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {SCENARI.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStart(s.id)}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-2 rounded-xl border border-cm-line2 bg-cm-surface p-[18px] text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-cm-accent hover:bg-cm-accent/[0.04]",
              focusRing,
            )}
          >
            <s.icon size={28} style={{ color: s.color }} aria-hidden="true" />
            <div className="cmmono font-cmmono text-[13px] font-semibold text-cm-ink">{s.title}</div>
            <div className="text-[11px] leading-normal text-cm-muted">{s.sub}</div>
            {s.block ? (
              <Badge kind="block">{s.badge}</Badge>
            ) : (
              <span
                className="cmmono inline-block w-fit rounded-full border px-[9px] py-[3px] font-cmmono text-[10px] font-semibold"
                style={{ color: s.color, background: s.color + "1f", borderColor: s.color + "4d" }}
              >
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Question({ step, selected, onSelect }: { step: GuidaQuestion; selected: GuidaOpt | null; onSelect: (o: GuidaOpt) => void }) {
  return (
    <div className="mb-3 rounded-xl border border-cm-line bg-cm-surface p-[22px]">
      <div className="cmmono mb-1.5 font-cmmono text-[10px] uppercase tracking-[0.1em] text-cm-faint">
        Passo {step.n} di {step.total}
      </div>
      <h2 className="mb-2 text-base font-semibold leading-snug text-cm-ink">{step.question}</h2>
      {step.desc && <p className="mb-4 text-xs leading-relaxed text-cm-muted">{step.desc}</p>}
      <div className="flex flex-col gap-2" role="radiogroup" aria-label={step.question}>
        {step.opts.map((o) => {
          const on = selected?.id === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(o)}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-150 hover:border-cm-accent hover:bg-cm-accent/[0.04]",
                on ? "border-cm-accent bg-cm-accent/[0.08]" : "border-cm-line2 bg-cm-surface2",
                focusRing,
              )}
            >
              <span className="mt-px shrink-0 text-cm-muted">
                <EmojiIcon emoji={o.icon} size={18} />
              </span>
              <span>
                <span className="mb-[3px] block text-[13px] font-semibold text-cm-ink">{o.title}</span>
                <span className="block text-[11px] text-cm-muted">{o.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionPlan({
  scenario, variant, checks, onCheck, onReset,
}: {
  scenario: string;
  variant: string;
  checks: Record<string, boolean>;
  onCheck: (id: string) => void;
  onReset: () => void;
}) {
  const plan: GuidaPlan | undefined = ACTIONS[scenario + ":" + variant];
  if (!plan)
    return (
      <div className="rounded-xl border border-cm-line bg-cm-surface px-4 py-8 text-center text-[12.5px] text-cm-faint">
        <Wrench size={24} className="mx-auto mb-2" aria-hidden="true" />
        Piano non disponibile per questa combinazione
      </div>
    );
  const sev = SEV_COLOR[plan.sev_color] || P.tick;
  const chksImm = plan.checks_immediate || [];
  const chksFol = plan.checks_followup || [];

  const checklist = (items: string[], prefix: string) => (
    <ul className="flex flex-col gap-1.5">
      {items.map((c, i) => {
        const id = `chk-${prefix}-${i}`;
        const done = !!checks[id];
        return (
          <li key={id} className="flex items-start gap-2 py-1">
            <input
              type="checkbox"
              id={id}
              checked={done}
              onChange={() => onCheck(id)}
              className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-cm-accent", focusRing)}
            />
            <label htmlFor={id} className={cn("cmmono cursor-pointer font-cmmono text-[11px] leading-snug", done ? "text-cm-faint line-through" : "text-cm-ink")}>
              {c}
            </label>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="rounded-xl border border-cm-line bg-cm-surface p-[22px]">
      <div className="mb-5 flex items-start gap-3.5">
        <span className="shrink-0 text-cm-accent">
          <EmojiIcon emoji={plan.icon} size={36} />
        </span>
        <div>
          <h2 className="mb-1 text-base font-semibold text-cm-ink">{plan.title}</h2>
          <p className="text-xs leading-normal text-cm-muted">Piano operativo guidato per la gestione di questa criticità</p>
          <span
            className="cmmono mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-cmmono text-[10px] font-semibold"
            style={{ background: sev + "26", color: sev, borderColor: sev + "59" }}
          >
            Severità: {plan.severity}
          </span>
        </div>
      </div>

      {plan.warning && (
        <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-cm-orange/25 bg-cm-orange/[0.08] px-3.5 py-3">
          <TriangleAlert size={16} className="shrink-0 text-cm-orange" aria-hidden="true" />
          <p className="cmmono font-cmmono text-[11px] leading-normal text-cm-orange">{plan.warning}</p>
        </div>
      )}
      {plan.tip && (
        <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-cm-accent/20 bg-cm-accent/[0.06] px-3.5 py-3">
          <Lightbulb size={16} className="shrink-0 text-cm-accent" aria-hidden="true" />
          <p className="cmmono font-cmmono text-[11px] leading-normal text-cm-accent">{plan.tip}</p>
        </div>
      )}

      {plan.timeline && (
        <Card glow={false} title={<><CalendarClock size={13} aria-hidden="true" /> Timeline azioni raccomandate</>}>
          <ol className="flex flex-col">
            {plan.timeline.map((t, i, arr) => (
              <li key={i} className="flex gap-3">
                <div className="flex w-2.5 shrink-0 flex-col items-center">
                  <span className="mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full bg-cm-accent" />
                  {i < arr.length - 1 && <span className="min-h-5 w-0.5 flex-1 bg-cm-line2" />}
                </div>
                <div className="flex-1 pb-2.5">
                  <div className="cmmono mb-0.5 font-cmmono text-[10px] font-semibold text-cm-accent">{t.when}</div>
                  <div className="mb-0.5 text-xs text-cm-ink">{t.what}</div>
                  <div className="text-[10px] text-cm-muted">{t.detail || ""}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <div className="mb-3.5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {chksImm.length > 0 && (
          <div className="rounded-lg border border-cm-line bg-cm-surface2 p-3.5">
            <h3 className="cmmono mb-2.5 flex items-center gap-1.5 font-cmmono text-[10px] font-semibold uppercase tracking-[0.08em] text-cm-muted">
              <Zap size={12} aria-hidden="true" /> Azioni immediate
            </h3>
            {checklist(chksImm, "imm")}
          </div>
        )}
        {chksFol.length > 0 && (
          <div className="rounded-lg border border-cm-line bg-cm-surface2 p-3.5">
            <h3 className="cmmono mb-2.5 flex items-center gap-1.5 font-cmmono text-[10px] font-semibold uppercase tracking-[0.08em] text-cm-muted">
              <ClipboardList size={12} aria-hidden="true" /> Follow-up e chiusura
            </h3>
            {checklist(chksFol, "fol")}
          </div>
        )}
      </div>

      {plan.escalation && (
        <div className="mb-3 rounded-lg border border-cm-bad/25 bg-cm-bad/[0.08] px-3.5 py-3">
          <h3 className="cmmono mb-1.5 flex items-center gap-1.5 font-cmmono text-[10px] font-bold uppercase tracking-[0.07em] text-cm-bad">
            <ArrowUpRight size={12} aria-hidden="true" /> Quando escalare
          </h3>
          <p className="cmmono font-cmmono text-[11px] leading-normal text-cm-muted">{plan.escalation}</p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-cm-line bg-cm-surface2 p-3.5 font-cmmono text-[11px]">
        <div className="mb-2 flex items-center gap-1.5 font-semibold text-cm-accent">
          <Pin size={12} aria-hidden="true" /> Prossimi passi nel sistema
        </div>
        <div className="leading-[2] text-cm-muted">
          1. Vai in <strong className="text-cm-ink">Gestione</strong> → trova la commessa → <Pencil size={11} className="inline align-[-1px]" aria-label="modifica" /> → aggiorna <strong>Owner</strong>, <strong>Priorità</strong> e <strong>Area</strong>
          <br />
          2. Aggiungi una <strong className="text-cm-ink">Condizione bloccante</strong> con tipo, descrizione e scadenza attesa
          <br />
          3. Vai in <strong className="text-cm-ink">Bloccanti</strong> per monitorare lo sblocco
          <br />
          4. Torna qui per aggiornare la checklist man mano che risolvi
        </div>
      </div>

      <div className="no-print mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReset}
          className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-cm-ok px-[22px] py-2.5 font-cmmono text-xs font-bold text-[#04221a] transition-colors duration-150 hover:brightness-110", focusRing)}
        >
          <CheckCircle2 size={14} aria-hidden="true" /> Affronta un'altra criticità
        </button>
        <Btn variant="s" className="px-4 py-2.5" onClick={() => window.print()}>
          <Printer size={14} aria-hidden="true" /> Stampa piano
        </Btn>
      </div>
    </div>
  );
}
