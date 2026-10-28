import React, { useState } from "react";
import { FileText, ListChecks, Printer } from "lucide-react";
import { G, S, areaOf, cwRowsOpen, getWKs, isDone, ownerName } from "../engine/state";
import { CMP_ORDER, azOpen, azScad, bloccantiPerArea, cmpWeeks, computeMens, critScore, kpiT, valOf } from "../engine/calc";
import type { BlkArea } from "../engine/calc";
import type { Row } from "../engine/types";
import { eur, fmtD, lblM, mkM } from "../engine/util";
import { Btn, Card, Empty, Kpi, KpiGrid, PageHeader } from "../ui/primitives";
import { RTable } from "../ui/rowtable";
import { P } from "../theme";
import { useS } from "../ui/useS";

const blank = <span className="block h-[18px] min-w-[130px] border-b border-cm-faint" />;
const f = (x: Date | null | undefined) => (x ? fmtD(x) : "—");
const ob = (r: Row) => (G(r.n).blocks || []).filter((b) => !b.resolved);
const ownerOfArea = (ar: string) => {
  const ow = S.cfg.owners.find((x) => x.id === (S.cfg.areaOwner || {})[ar]);
  return ow ? ow.name : "—";
};

function AzioniCard() {
  const op = azOpen();
  if (!op.length) return null;
  return (
    <Card title="Azioni aperte dalle riunioni precedenti">
      <RTable
        head={["Azione", "Chi", "Entro", "Commessa", "Stato"]}
        rows={op.map((a) => [
          a.t,
          a.who || "—",
          a.due ? fmtD(new Date(a.due + "T00:00:00")) : "—",
          a.n || "—",
          azScad(a) ? <span className="text-cm-bad">scaduta</span> : "aperta",
        ])}
      />
    </Card>
  );
}

function BloccantiAreaCard({ BA }: { BA: Record<string, BlkArea> }) {
  const bl = Object.entries(BA).sort((x, y) => y[1].n - x[1].n);
  return (
    <Card title="Bloccanti per area">
      {bl.length ? (
        <RTable
          head={["Area", "Owner", "Bloccanti", "Tipo", "Cosa blocca", "Azione / entro"]}
          rows={bl.map(([ar, o]) => [
            <b>{ar}</b>,
            ownerOfArea(ar),
            <b className="text-[15px] text-cm-orange">{o.n}</b>,
            <>
              {Object.entries(o.t).map(([k, v], i) => (
                <React.Fragment key={k}>
                  {i > 0 && <br />}
                  {`${String(k).toLowerCase()} ${v}`}
                </React.Fragment>
              ))}
            </>,
            <>
              {o.l.slice(0, 4).map((l, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  <b>{l.n}</b> {l.cli} · {l.tipo}
                  {l.age ? ` (da ${l.age} gg)` : ""} — {l.desc}
                </React.Fragment>
              ))}
              {o.l.length > 4 && (
                <>
                  <br />
                  <span className="text-cm-faint">…e altri {o.l.length - 4}</span>
                </>
              )}
            </>,
            blank,
          ])}
        />
      ) : (
        <div className="px-1 py-3 text-[13px] text-cm-ok">Nessun bloccante aperto in nessuna area.</div>
      )}
    </Card>
  );
}

function ChangesCard({ prev, limit }: { prev: string; limit: number }) {
  const X = cmpWeeks(prev, S.wk as string),
    cnt: Record<string, number> = {};
  X.forEach((x) => (cnt[x.t] = (cnt[x.t] || 0) + 1));
  const imp = X.filter((x) => x.t !== "Commento aggiornato").slice(0, limit);
  const parts = CMP_ORDER.filter((t) => cnt[t]);
  return (
    <Card title={`Cosa è cambiato da ${prev}`}>
      <div className="pb-2 text-xs">
        {parts.length
          ? parts.map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && " · "}
                {t}: <b>{cnt[t]}</b>
              </React.Fragment>
            ))
          : "Nessuna variazione"}
      </div>
      {imp.length > 0 && (
        <RTable
          head={["Variazione", "Commessa", "Cliente", "Dettaglio"]}
          rows={imp.map((x) => [x.t, x.n.slice(0, 22), x.cli.slice(0, 24), x.d])}
        />
      )}
    </Card>
  );
}

function rischio(r: Row) {
  return ob(r).length ? `${ob(r).length} bloccanti` : r.det && r.det.stats.tracked && !r.det.stats.pending ? "righe complete" : "—";
}

function Sint() {
  const rows = cwRowsOpen();
  if (!rows.length) return null;
  const mens = computeMens();
  const KT = kpiT(),
    cur = mkM(S.refDate),
    M = mens.M,
    ND = mens.ND;
  const rit = rows.filter((r) => r.in_ritardo),
    wd = rows.filter((r) => r.det),
    nb = rows.reduce((a, r) => a + ob(r).length, 0);
  const BA = bloccantiPerArea(rows);
  const wks = getWKs(),
    prev = wks[wks.indexOf(S.wk as string) - 1],
    pr = prev ? S.rows.filter((r) => !isDone(r) && r.wk === prev) : null;
  const dl = (v: number, p: number | null | undefined) =>
    p == null ? null : (
      <span className="text-cm-faint">
        {" "}
        ({v - p >= 0 ? "+" : ""}
        {v - p} rispetto a {prev})
      </span>
    );
  const L: [string, React.ReactNode][] = [
    [
      rit.length / rows.length > 0.5 ? P.bad : P.orange,
      <>
        <b>{rows.length}</b> commesse aperte{dl(rows.length, pr && pr.length)}; <b>{rit.length}</b> in ritardo ({Math.round((100 * rit.length) / rows.length)}%)
        {dl(rit.length, pr && pr.filter((r) => r.in_ritardo).length)}, di cui <b>{rit.filter((r) => r.ritardo > 90).length}</b> oltre 90 giorni.
      </>,
    ],
  ];
  const c0 = M[cur];
  if (c0 && c0.tot && !(S.det && S.det.noDone)) {
    const p = (c0.pr / c0.tot) * 100;
    L.push([
      p >= KT.av ? P.ok : p >= KT.av - 15 ? P.orange : P.bad,
      <>
        <b>{lblM(cur)}</b>: completati <b>{eur(c0.pr)}</b> su {eur(c0.tot)} previsti ({p.toFixed(0)}%).
      </>,
    ]);
  }
  if (mens.scad)
    L.push([
      P.bad,
      <>
        <b>{eur(mens.scad)}</b> di righe già scadute ancora da completare.
      </>,
    ]);
  if (ND.righe)
    L.push([
      P.orange,
      <>
        <b>{ND.righe}</b> righe ({eur(ND.tot)}) senza un mese assegnato: da pianificare.
      </>,
    ]);
  L.push([
    nb ? P.orange : P.ok,
    nb ? (
      <>
        <b>{nb}</b> bloccanti aperti (
        {Object.entries(BA)
          .sort((x, y) => y[1].n - x[1].n)
          .map(([ar, o]) => ar + ": " + o.n)
          .join(" · ")}
        ).
      </>
    ) : (
      "Nessun bloccante aperto."
    ),
  ]);
  if (S.det && rows.length > wd.length) L.push([P.mute, `${rows.length - wd.length} commesse aperte non hanno ancora il dettaglio righe nel file Movimenti.`]);

  const crit = rows
    .map((r) => ({ r, b: ob(r), sc: critScore(r) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 8);
  const ks = Object.keys(M).map(Number).sort((a, b) => a - b),
    i0 = Math.max(0, ks.findIndex((k) => k >= cur)),
    mk = ks.slice(Math.max(0, i0 - 1), i0 + 3).map((k) => M[k]);
  const NP = Object.entries(mens.NP || {}).sort((x, y) => y[1].tot - x[1].tot);
  const lim = new Date(S.refDate.getTime() + 14 * 86400000),
    nx = rows.filter((r) => r.concl && r.concl >= S.refDate && r.concl <= lim).sort((a, b) => +(a.concl as Date) - +(b.concl as Date)).slice(0, 10);
  const C: Record<string, { n: number; r: number; g: number }> = {};
  rows.forEach((r) => {
    const o = (C[r.cliente] = C[r.cliente] || { n: 0, r: 0, g: 0 });
    o.n++;
    if (r.in_ritardo) {
      o.r++;
      o.g += r.ritardo;
    }
  });
  const A: Record<string, { n: number; r: number; b: number }> = {};
  rows.forEach((r) => {
    const a = areaOf(r) || "Non assegnata";
    const o = (A[a] = A[a] || { n: 0, r: 0, b: 0 });
    o.n++;
    if (r.in_ritardo) o.r++;
    o.b += ob(r).length;
  });

  return (
    <>
      <div className="mb-3 mt-1 text-[13px]">
        <b>Riunione commesse</b> · {S.wk} · {f(S.refDate)}
      </div>
      <Card title="In sintesi">
        <div className="text-[13px] leading-[1.9]">
          {L.map((x, i) => (
            <div key={i}>
              <span className="mr-[9px] inline-block h-[9px] w-[9px] rounded-full" style={{ background: x[0] }} />
              {x[1]}
            </div>
          ))}
        </div>
      </Card>
      <AzioniCard />
      <Card title="Da decidere oggi (le 8 più critiche)">
        <RTable
          head={["Commessa", "Cliente", "Ritardo", "Owner", "Problema", "Decisione / chi / entro"]}
          rows={crit.map((x) => [
            x.r.n.slice(0, 24),
            x.r.cliente.slice(0, 22),
            x.r.in_ritardo ? x.r.ritardo + " gg" : "—",
            ownerName(x.r),
            x.b.map((b) => b.tipo.toLowerCase()).join(", ") || "—",
            blank,
          ])}
        />
      </Card>
      <BloccantiAreaCard BA={BA} />
      <Card title="Avanzamento per mese">
        <RTable
          head={["Mese", "Commesse concluse", "In ritardo", "Valore completato"]}
          rows={mk.map((m) => [
            <b>{lblM(m.k)}</b>,
            m.n ? `${m.conc} su ${m.n}` : "—",
            m.rit ? <span className="text-cm-bad">{m.rit}</span> : "—",
            m.tot ? `${eur(m.pr)} su ${eur(m.tot)} (${Math.round((m.pr / m.tot) * 100)}%)` : "—",
          ])}
        />
      </Card>
      {NP.length > 0 && (
        <Card title="Righe da pianificare (senza mese assegnato)">
          <RTable head={["Reparto", "Righe", "Valore", "Mese da assegnare"]} rows={NP.map(([k, o]) => [<b>{k}</b>, o.n, eur(o.tot), blank])} />
        </Card>
      )}
      {prev && <ChangesCard prev={prev} limit={8} />}
      <Card title="Scadenze nei prossimi 14 giorni">
        {nx.length ? (
          <RTable
            head={["Scade", "Commessa", "Cliente", "Owner", "Rischio"]}
            rows={nx.map((r) => [f(r.concl), r.n.slice(0, 24), r.cliente.slice(0, 24), ownerName(r), rischio(r)])}
          />
        ) : (
          <Empty>Nessuna scadenza nei prossimi 14 giorni.</Empty>
        )}
      </Card>
      <Card title="Clienti con più ritardi">
        <RTable
          head={["Cliente", "Aperte", "In ritardo", "Ritardo medio"]}
          rows={Object.entries(C)
            .filter((e) => e[1].r)
            .sort((a, b) => b[1].r - a[1].r)
            .slice(0, 6)
            .map(([k, o]) => [k.slice(0, 32), o.n, o.r, Math.round(o.g / o.r) + " gg"])}
        />
      </Card>
      <Card title="Carico per area">
        <RTable
          head={["Area", "Owner", "Aperte", "In ritardo"]}
          rows={Object.entries(A)
            .sort((a, b) => b[1].n - a[1].n)
            .map(([a, o]) => [a, ownerOfArea(a), o.n, o.r])}
        />
      </Card>
      <Card title="Azioni decise in riunione">
        <RTable head={["Azione", "Chi", "Entro"]} rows={[1, 2, 3, 4].map(() => [blank, blank, blank])} />
      </Card>
    </>
  );
}

function Full() {
  const rows = cwRowsOpen();
  if (!rows.length) return null;
  const rit = rows.filter((r) => r.in_ritardo),
    ritMed = rit.length ? Math.round(rit.reduce((a, r) => a + r.ritardo, 0) / rit.length) : 0;
  const nb = rows.reduce((a, r) => a + ob(r).length, 0),
    wd = rows.filter((r) => r.det),
    ready = wd.filter((r) => r.det!.stats.tracked > 0 && r.det!.stats.pending === 0);
  const wks = getWKs(),
    prev = wks[wks.indexOf(S.wk as string) - 1];
  const crit = rows
    .map((r) => ({ r, b: ob(r), sc: critScore(r) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 10);
  const lim = new Date(S.refDate.getTime() + 14 * 86400000),
    nx = rows.filter((r) => r.concl && r.concl >= S.refDate && r.concl <= lim).sort((a, b) => +(a.concl as Date) - +(b.concl as Date)).slice(0, 10);
  const A: Record<string, { n: number; r: number; b: number; v: number }> = {};
  rows.forEach((r) => {
    const a = areaOf(r) || "Non assegnata";
    const o = (A[a] = A[a] || { n: 0, r: 0, b: 0, v: 0 });
    o.n++;
    if (r.in_ritardo) o.r++;
    o.b += ob(r).length;
    if (r.det) o.v += valOf(r).res;
  });
  return (
    <>
      <div className="mb-3 mt-1 text-[13px]">
        <b>Riunione commesse</b> — {S.wk} · riferimento {f(S.refDate)}
        {S.det && S.useDet ? " · scadenze aggiornate dalle righe" : ""}
      </div>
      <KpiGrid>
        <Kpi label="Commesse aperte" value={rows.length} color={P.accent} />
        <Kpi label="In ritardo" value={`${rit.length} (${Math.round((100 * rit.length) / rows.length)}%)`} sub={`medio ${ritMed} gg`} color={P.bad} />
        <Kpi label="Bloccanti aperti" value={nb} color={P.orange} />
        {wd.length > 0 && <Kpi label="Pronte da consegnare" value={ready.length} sub="righe al 100%" color={P.ok} />}
        {wd.length > 0 && <Kpi label="Valore da completare" value={eur(wd.reduce((a, r) => a + valOf(r).res, 0))} sub="commesse con righe" color={P.accent} />}
      </KpiGrid>
      {prev && <ChangesCard prev={prev} limit={10} />}
      <AzioniCard />
      <Card title="Le 10 più critiche">
        <RTable
          head={["Commessa", "Cliente", "Ritardo", "Area", "Owner", "Bloccanti"]}
          rows={crit.map((x) => [
            x.r.n.slice(0, 24),
            x.r.cliente.slice(0, 24),
            x.r.in_ritardo ? x.r.ritardo + " gg" : "—",
            areaOf(x.r) || "—",
            ownerName(x.r),
            x.b.map((b) => b.tipo.toLowerCase()).join(", ") || "—",
          ])}
        />
      </Card>
      <BloccantiAreaCard BA={bloccantiPerArea(rows)} />
      <Card title="Scadenze nei prossimi 14 giorni">
        {nx.length ? (
          <RTable
            head={["Scade", "Commessa", "Cliente", "Area", "Owner", "Rischio"]}
            rows={nx.map((r) => [f(r.concl), r.n.slice(0, 24), r.cliente.slice(0, 24), areaOf(r) || "—", ownerName(r), rischio(r)])}
          />
        ) : (
          <Empty>Nessuna.</Empty>
        )}
      </Card>
      <Card title="Carico per area">
        <RTable
          head={["Area", "Owner", "Aperte", "In ritardo", "Bloccanti", ...(wd.length ? ["Da completare"] : [])]}
          rows={Object.entries(A)
            .sort((a, b) => b[1].n - a[1].n)
            .map(([a, o]) => [a, ownerOfArea(a), o.n, o.r, o.b, ...(wd.length ? [eur(o.v)] : [])])}
        />
      </Card>
    </>
  );
}

export default function Report() {
  useS();
  const [mode, setMode] = useState<"sint" | "full">("sint");
  return (
    <div>
      <PageHeader
        icon={<FileText size={22} />}
        title="Report riunione"
        desc="Pagina pronta per la riunione: stampala o salvala in PDF."
        right={
          <div className="no-print flex flex-wrap items-center gap-2">
            <Btn variant={mode === "sint" ? "p" : "s"} aria-pressed={mode === "sint"} onClick={() => setMode("sint")}>
              <ListChecks size={14} /> Sintetico
            </Btn>
            <Btn variant={mode === "full" ? "p" : "s"} aria-pressed={mode === "full"} onClick={() => setMode("full")}>
              <FileText size={14} /> Completo
            </Btn>
            <Btn variant="p" onClick={() => window.print()}>
              <Printer size={14} /> Stampa / Salva PDF
            </Btn>
          </div>
        }
      />
      {mode === "full" ? <Full /> : <Sint />}
    </div>
  );
}
