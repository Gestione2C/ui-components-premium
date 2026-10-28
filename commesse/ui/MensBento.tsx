import React from "react";
import { AnalyticsBento } from "@/components/analytics-bento";
import { G, S, areaOf, cwRowsOpen, openBlocks } from "../engine/state";
import { valOf, type Mens } from "../engine/calc";
import { eur, lblM } from "../engine/util";
import { areaColor } from "./primitives";
import { P } from "../theme";

/**
 * "Quadro d'insieme" dell'avanzamento mensile con il componente AnalyticsBento di ui-components-premium.
 * Usa SOLO numeri già calcolati da computeMens() e dalle commesse aperte: nessuna nuova logica di business.
 */
export default function MensBento({ m }: { m: Mens }) {
  const months = m.A.filter((x) => x.k > 1);
  if (m.A.length < 2 || months.length < 3) return null;

  const rows = cwRowsOpen();
  const n = rows.length;
  const inRit = rows.filter((r) => r.in_ritardo).length;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const concTot = m.A.reduce((a, x) => a + x.conc, 0);
  const prTot = m.TT.pr;
  const totTot = m.TT.tot;
  // stesso perimetro del KPI "Lavoro completato" (nel Piano: fino al mese in corso, arretrato compreso)
  const lastLbl = lblM(m.cur);

  // carico per cliente (prime 10 + "Altri"), colorato per area prevalente
  const by: Record<string, { n: number; rit: number; res: number; ar: Record<string, number> }> = {};
  rows.forEach((r) => {
    const o = (by[r.cliente] = by[r.cliente] || { n: 0, rit: 0, res: 0, ar: {} });
    o.n++;
    if (r.in_ritardo) o.rit++;
    if (r.det) o.res += valOf(r).res;
    const a = areaOf(r) || "Non assegnata";
    o.ar[a] = (o.ar[a] || 0) + 1;
  });
  const list = Object.entries(by).sort((a, b) => b[1].n - a[1].n);
  const top = list.slice(0, 10);
  const rest = list.slice(10);
  const grp = (o: { ar: Record<string, number> }) => Object.entries(o.ar).sort((a, b) => b[1] - a[1])[0][0];
  const items = top.map(([name, o]) => ({ name: name.length > 24 ? name.slice(0, 24) + "…" : name, group: grp(o), values: [o.n, o.rit, Math.round(o.res)] }));
  if (rest.length) {
    const o = rest.reduce((a, [, x]) => ({ n: a.n + x.n, rit: a.rit + x.rit, res: a.res + x.res, ar: { ...a.ar, ...x.ar } }), { n: 0, rit: 0, res: 0, ar: {} as Record<string, number> });
    items.push({ name: "Altri", group: grp(o), values: [o.n, o.rit, Math.round(o.res)] });
  }
  const used = new Set(items.map((i) => i.group));
  const groups = [...S.cfg.areas, "Non assegnata"]
    .filter((a) => used.has(a))
    .map((a) => ({ id: a, name: a, color: areaColor(a) || P.mute, ink: "dark" as const }));
  const resTot = items.reduce((a, i) => a + i.values[2], 0);

  // tabella per area
  const A: Record<string, { n: number; r: number; b: number }> = {};
  rows.forEach((r) => {
    const a = areaOf(r) || "Non assegnata";
    const o = (A[a] = A[a] || { n: 0, r: 0, b: 0 });
    o.n++;
    if (r.in_ritardo) o.r++;
    o.b += openBlocks(r.n).length;
  });
  void G;

  const mv = months.map((x) => x.tot);
  const mn = months.map((x) => x.n);
  const short = months.map((x) => lblM(x.k).split(" ")[0]);
  const axis = new Set(short).size === short.length ? short : months.map((x) => lblM(x.k));
  const peak = (v: number[]) => months[v.indexOf(Math.max(...v))];

  return (
    <div className="mb-4 rounded-2xl">
      <AnalyticsBento
        currency=""
        locale="it-IT"
        credit={false}
        fontFamily="'Fira Sans', ui-sans-serif, system-ui, sans-serif"
        monoFamily="'Fira Code', ui-monospace, monospace"
        colors={{ revenue: [P.accent, P.ok], desktop: [P.bad, P.orange], mobile: [P.ok, P.accent], radar: P.accent }}
        revenue={{
          label: "Lavoro completato (€)",
          value: Math.round(m.TD.pr),
          delta: m.av.toFixed(0) + "%",
          note: `su ${eur(m.TD.tot)} ${m.PI ? "da fare fino a " + lastLbl : "previsti"}`,
          caption: "Completato per mese (€)",
          unit: "Completato (€)",
          series: m.A.map((x) => ({ label: lblM(x.k), value: Math.round(x.pr) })),
        }}
        sessions={{
          label: "Commesse aperte",
          value: n,
          delta: concTot + " concluse",
          note: `${inRit} oltre la data prevista (${pct(inRit, n)}%)`,
          desktop: [m.A.map((x) => x.rit)],
          mobile: [m.A.map((x) => x.conc)],
          pointLabels: m.A.map((x) => lblM(x.k)),
          labels: { desktop: "In ritardo", mobile: "Concluse", prior: "", current: "" },
        }}
        categories={{
          title: "Carico per cliente",
          shareLabel: "Quota",
          groups,
          periods: [
            { label: "Commesse aperte", total: n, delta: list.length + " clienti", compare: "per cliente, colore = area prevalente" },
            { label: "In ritardo", total: inRit, delta: pct(inRit, n) + "%", compare: "commesse oltre la data prevista" },
            { label: "Residuo (€)", total: resTot, delta: pct(resTot, resTot + Math.round(prTot)) + "%", compare: "valore ancora da completare" },
          ],
          items,
          table: {
            columns: ["Area", "Aperte", "In ritardo", "Bloccanti"],
            rows: Object.entries(A)
              .sort((a, b) => b[1].n - a[1].n)
              .map(([a, o]) => ({ label: a, values: [String(o.n), String(o.r), String(o.b)] })),
          },
        }}
        seasonality={{
          title: "Scadenze per mese",
          unit: "Valore (€)",
          yearLabel: "Vista",
          axis,
          years: [
            {
              label: "Valore",
              values: mv.map((v) => Math.round(v)),
              stats: [
                { label: "Previsto totale (€)", value: Math.round(totTot), delta: pct(prTot, totTot) + "%", note: "completato (tutti i mesi)" },
                { label: "Residuo (€)", value: Math.round(totTot - prTot), delta: pct(totTot - prTot, totTot) + "%", note: "da fare" },
              ],
              rows: [
                { label: "Mese più carico", value: lblM(peak(mv).k) },
                { label: "Righe senza mese", value: String(m.ND.righe) },
              ],
            },
            {
              label: "Commesse",
              values: mn,
              stats: [
                { label: "Con scadenza", value: mn.reduce((a, b) => a + b, 0), delta: concTot + "", note: "concluse" },
                { label: "In ritardo", value: m.A.reduce((a, x) => a + x.rit, 0), delta: pct(inRit, n) + "%", note: "delle aperte" },
              ],
              rows: [
                { label: "Mese più carico", value: lblM(peak(mn).k) },
                { label: "Arretrato", value: String(m.A.find((x) => x.k === 1)?.n || 0) },
              ],
            },
          ],
        }}
      />
    </div>
  );
}
