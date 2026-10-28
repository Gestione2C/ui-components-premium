import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { G, S, areaOf, cwRowsOpen, ownerName } from "../engine/state";
import type { Blocco, Row } from "../engine/types";
import { fmtD } from "../engine/util";
import { Card, FIELD, Hint, Kpi, KpiGrid, PageHeader } from "../ui/primitives";
import { RTable } from "../ui/rowtable";
import { P } from "../theme";
import { useS } from "../ui/useS";

const sig = (r: Row) => [r.stato, r.commento || "", r.concl_orig ? +r.concl_orig : ""].join("|");

export default function Attenzione() {
  useS();
  const [wIn, setW] = useState("2");
  const [dIn, setD] = useState("14");
  const head = <PageHeader icon={<AlertTriangle size={22} />} title="Attenzione" desc="Cosa rischia di sfuggire: commesse ferme, date che slittano, bloccanti aperti da troppo tempo." />;
  if (!S.rows.length) return head;

  const W = Math.max(2, +wIn || 2),
    D = Math.max(1, +dIn || 14),
    op = cwRowsOpen(),
    ref = S.refDate;
  const fer: { r: Row; w: number }[] = [],
    sl: { r: Row; mv: number; ds: number; from: Date | null }[] = [];
  op.forEach((r) => {
    const h = S.rows.filter((x) => x.n === r.n && x.wk <= (S.wk as string)).sort((a, b) => (a.wk < b.wk ? -1 : 1));
    if (!h.length) return;
    let w = 1;
    for (let i = h.length - 2; i >= 0 && sig(h[i]) === sig(h[h.length - 1]); i--) w++;
    if (h.length >= 2 && w >= W) fer.push({ r, w });
    let mv = 0,
      ds = 0;
    for (let i = 1; i < h.length; i++) {
      const a = h[i - 1].concl_orig,
        b = h[i].concl_orig;
      if (a && b && b > a) {
        mv++;
        ds += Math.round((+b - +a) / 864e5);
      }
    }
    if (mv) sl.push({ r, mv, ds, from: h[0].concl_orig });
  });
  fer.sort((a, b) => b.w - a.w);
  sl.sort((a, b) => b.mv - a.mv || b.ds - a.ds);
  const bl: { r: Row; b: Blocco; age: number; ar: string }[] = [],
    AR: Record<string, { n: number; s: number; m: number }> = {};
  op.forEach((r) =>
    (G(r.n).blocks || [])
      .filter((b) => !b.resolved)
      .forEach((b) => {
        const age = b.createdAt ? Math.max(0, Math.floor((+ref - +new Date(b.createdAt)) / 864e5)) : 0,
          ar = areaOf(r) || "Non assegnata",
          o = (AR[ar] = AR[ar] || { n: 0, s: 0, m: 0 });
        o.n++;
        o.s += age;
        o.m = Math.max(o.m, age);
        if (age >= D) bl.push({ r, b, age, ar });
      }),
  );
  bl.sort((a, b) => b.age - a.age);
  const nw = [...new Set(S.rows.map((r) => r.wk))].length;
  const areas = Object.entries(AR).sort((a, b) => b[1].n - a[1].n);

  return (
    <div>
      {head}
      <div className="no-print mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-cm-muted">
        <label className="flex items-center gap-1.5">
          Commessa ferma se invariata da almeno
          <input type="number" className={`${FIELD} w-[64px]`} min={2} value={wIn} onChange={(e) => setW(e.target.value)} />
          settimane
        </label>
        <label className="flex items-center gap-1.5">
          Bloccante vecchio se aperto da almeno
          <input type="number" className={`${FIELD} w-[68px]`} min={1} value={dIn} onChange={(e) => setD(e.target.value)} />
          giorni
        </label>
      </div>
      <KpiGrid>
        <Kpi label="Commesse ferme" value={fer.length} sub={`invariate da almeno ${W} settimane`} color={fer.length ? P.orange : P.ok} />
        <Kpi label="Date slittate" value={sl.length} sub="commesse con data di fine spostata in avanti" color={sl.length ? P.orange : P.ok} />
        <Kpi label="Bloccanti vecchi" value={bl.length} sub={`aperti da almeno ${D} giorni`} color={bl.length ? P.bad : P.ok} />
      </KpiGrid>
      <Card title="Commesse ferme">
        <Hint>Stato, commento e data di fine non cambiano da più settimane: nessuno le sta muovendo.</Hint>
        <RTable
          head={["Commessa", "Cliente", "Stato", "Invariata da", "Ritardo", "Owner"]}
          empty={nw < 2 ? "Servono almeno due settimane caricate." : "Nessuna commessa ferma con questa soglia."}
          rows={fer.map((x) => [
            x.r.n.slice(0, 24),
            x.r.cliente.slice(0, 26),
            x.r.stato,
            <>
              <b>{x.w}</b> settimane
            </>,
            x.r.in_ritardo ? x.r.ritardo + " gg" : "—",
            ownerName(x.r),
          ])}
        />
      </Card>
      <Card title="Date che slittano">
        <Hint>Quante volte la data di fine prevista è stata spostata in avanti tra una settimana e l'altra.</Hint>
        <RTable
          head={["Commessa", "Cliente", "Spostamenti", "Data originale", "Data attuale", "Giorni in più"]}
          empty={nw < 2 ? "Servono almeno due settimane caricate." : "Nessuna data spostata in avanti."}
          rows={sl.map((x) => [
            x.r.n.slice(0, 24),
            x.r.cliente.slice(0, 26),
            <b>{x.mv}</b>,
            fmtD(x.from),
            fmtD(x.r.concl_orig),
            <span className="text-cm-orange">+{x.ds} gg</span>,
          ])}
        />
      </Card>
      <Card title="Bloccanti vecchi">
        <Hint>Bloccanti ancora aperti da molto tempo, e situazione per area.</Hint>
        <RTable
          head={["Area", "Commessa", "Tipo", "Cosa blocca", "Aperto da"]}
          empty="Nessun bloccante vecchio con questa soglia."
          rows={bl.map((x) => [
            x.ar,
            x.r.n.slice(0, 24),
            String(x.b.tipo || "").toLowerCase(),
            String(x.b.desc || "").replace(/[«»]/g, "").slice(0, 80),
            <span className="font-semibold text-cm-bad">{x.age} gg</span>,
          ])}
        />
        {areas.length > 0 && (
          <div className="mt-3">
            <RTable
              head={["Area", "Bloccanti aperti", "Età media", "Il più vecchio"]}
              rows={areas.map(([a, o]) => [<b>{a}</b>, o.n, Math.round(o.s / o.n) + " gg", o.m + " gg"])}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
