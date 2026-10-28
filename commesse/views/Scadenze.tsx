import React from "react";
import { CalendarClock, Construction, Pencil } from "lucide-react";
import { G, S, cwRows, cwRowsOpen } from "../engine/state";
import { Badge, Btn, Card, Empty, Kpi, KpiGrid, Legend, PageHeader, PrioTag, RowArea, RowOwner, Table, TblBox, WkBar } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick, valLabels } from "../ui/Chart";
import { openModal } from "../ui/overlays";
import { fdIt, fmtD } from "../engine/util";
import { P } from "../theme";
import { useS } from "../ui/useS";
import type { Row } from "../engine/types";

const openBlk = (r: Row) => (G(r.n).blocks || []).filter((b) => !b.resolved).length;

interface Issue {
  t: string;
  n: string;
  d: string;
}
function computeDQ() {
  const all = cwRows(),
    open = cwRowsOpen(),
    iss: Issue[] = [],
    cnt: Record<string, number> = {},
    seen: Record<string, number> = {};
  const add = (t: string, r: Row, d: string) => {
    iss.push({ t, n: r.n, d });
    cnt[t] = (cnt[t] || 0) + 1;
  };
  all.forEach((r) => (seen[r.n] = (seen[r.n] || 0) + 1));
  all.forEach((r) => {
    if (seen[r.n] > 1) add("Duplicato", r, `numero presente ${seen[r.n]} volte`);
    if ((r.colore === "verde") !== (r.stato.trim().toLowerCase() === "concluso")) add("Colore ≠ stato", r, `colore ${r.colore || "nessuno"}, stato "${r.stato}"`);
  });
  all.forEach((r) => {
    if (r.concluso && r.det && r.det.stats.pending > 0) add("Concluso con righe aperte", r, `${r.det.stats.pending} righe non complete su ${r.det.stats.tot}`);
  });
  ((S.det && S.det.unmatched) || []).forEach((o) => {
    iss.push({ t: "Righe senza commessa", n: "", d: o });
    cnt["Righe senza commessa"] = (cnt["Righe senza commessa"] || 0) + 1;
  });
  open.forEach((r) => {
    if (!r.concl) add("Senza data prevista", r, 'manca "Concl. prevista"');
    else if (r.data && r.concl < r.data) add("Date incoerenti", r, "prevista precedente alla data ordine");
    if (r.ritardo > 180) add("Data da rivedere", r, `ritardo di ${r.ritardo} gg: la data prevista è aggiornata?`);
    const m = r.concl && r.in_ritardo && (r.commento || "").match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (m && +m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) {
      const y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : r.concl!.getFullYear(),
        cd = new Date(y, +m[2] - 1, +m[1]);
      if (cd > r.concl!) add("Data nel commento", r, `il commento cita ${m[1]}/${m[2]}, oltre la prevista (${fdIt(r.concl!)})`);
    }
  });
  return { iss, cnt };
}

const SEV: [string, string, (d: number) => boolean][] = [
  ["≤ 30 gg", "#ffd24d", (d) => d <= 30],
  ["31–90", "#ff9f43", (d) => d > 30 && d <= 90],
  ["91–180", "#ff5d73", (d) => d > 90 && d <= 180],
  ["181–365", "#c9184a", (d) => d > 180 && d <= 365],
  ["> 1 anno", "#7b2cbf", (d) => d > 365],
];
const sevCol = (d: number) => (SEV.find((x) => x[2](d)) || SEV[0])[1];

export default function Scadenze() {
  useS();
  const rows = cwRowsOpen();
  const n = rows.length;
  const inRit = rows.filter((r) => r.in_ritardo);

  // prossimi 14 giorni
  const lim = new Date(S.refDate.getTime() + 14 * 86400000);
  const nx = rows.filter((r) => r.concl && r.concl >= S.refDate && r.concl <= lim).sort((a, b) => a.concl!.getTime() - b.concl!.getTime());

  const { iss, cnt } = computeDQ();

  const top = inRit.slice().sort((a, b) => b.ritardo - a.ritardo).slice(0, 12);
  const crit = rows.filter((r) => r.in_ritardo && r.ritardo > 30).sort((a, b) => b.ritardo - a.ritardo);
  const r180 = inRit.filter((r) => r.ritardo > 180).length;

  return (
    <div>
      <PageHeader
        icon={<CalendarClock size={22} />}
        title="Scadenze"
        desc="Le commesse in ritardo, ordinate per gravità: parti dalle più vecchie."
        right={<WkBar />}
      />
      <KpiGrid>
        <Kpi label="Totale in ritardo" value={`${inRit.length}/${n}`} color={P.bad} />
        <Kpi label="Ritardo > 30 gg" value={inRit.filter((r) => r.ritardo > 30).length} color={P.bad} />
        <Kpi label="Ritardo > 90 gg" value={inRit.filter((r) => r.ritardo > 90).length} color={P.bad} />
        <Kpi label="Ritardo > 180 gg" value={r180} color={r180 > 0 ? P.bad : P.ok} />
      </KpiGrid>

      <Card
        title="Top ritardi (giorni)"
        right={<Legend items={SEV.map((x) => ({ color: x[1], label: `${x[0]} (${inRit.filter((r) => x[2](r.ritardo)).length})` }))} />}
      >
        <ChartCanvas
          height={320}
          label="Top ritardi (giorni)"
          config={{
            type: "bar",
            plugins: [valLabels],
            data: {
              labels: top.map((r) => (r.n.length > 22 ? r.n.slice(0, 22) + "…" : r.n)),
              datasets: [{ data: top.map((r) => r.ritardo), backgroundColor: top.map((r) => sevCol(r.ritardo)), borderRadius: 4, borderSkipped: false, maxBarThickness: 18 }],
            },
            options: {
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              layout: { padding: { right: 46 } },
              plugins: {
                legend: { display: false },
                valLabels: { horizontal: true },
                tooltip: { callbacks: { label: (c: any) => `${c.raw} gg · ${top[c.dataIndex].cliente.slice(0, 30)}` } },
              },
              scales: {
                x: { beginAtZero: true, ticks: tick, grid: gridY },
                y: { ticks: { ...tick, font: { size: 10 } }, grid: noGrid },
              },
            },
          }}
        />
      </Card>

      <Card
        title={
          <>
            Scadenze nei prossimi 14 giorni <span className="text-cm-faint">({nx.length})</span>
          </>
        }
        bodyClass="px-0 py-0"
      >
        {!nx.length ? (
          <Empty>Nessuna commessa aperta in scadenza nei prossimi 14 giorni.</Empty>
        ) : (
          <TblBox>
            <Table>
              <thead>
                <tr>
                  <th>N. Commessa</th>
                  <th>Cliente</th>
                  <th>Scade</th>
                  <th>Tra</th>
                  <th>Area</th>
                  <th>Rischio</th>
                </tr>
              </thead>
              <tbody>
                {nx.map((r) => {
                  const b = openBlk(r),
                    dd = Math.round((r.concl!.getTime() - S.refDate.getTime()) / 86400000);
                  return (
                    <tr key={r.n}>
                      <td className="text-[10px]">{r.n}</td>
                      <td className="max-w-[150px] truncate">{r.cliente}</td>
                      <td>{fdIt(r.concl!)}</td>
                      <td>{dd === 0 ? "oggi" : dd + " gg"}</td>
                      <td>
                        <RowArea r={r} small />
                      </td>
                      <td>
                        {b > 0 ? (
                          <span className="inline-flex items-center gap-1 text-cm-bad">
                            <Construction size={12} /> {b} bloccant{b > 1 ? "i" : "e"}
                          </span>
                        ) : r.det && r.det.stats.tracked && !r.det.stats.pending ? (
                          <span className="text-cm-ok">Righe complete</span>
                        ) : r.stato_key === "parz" ? (
                          <span className="text-cm-warn">Parziale</span>
                        ) : (
                          <span className="text-cm-ok">Regolare</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TblBox>
        )}
      </Card>

      <Card
        title={
          <>
            Controllo qualità dati <span className="text-cm-faint">{iss.length ? "(" + iss.length + ")" : ""}</span>
          </>
        }
        bodyClass="px-0 py-0 pt-2"
      >
        <div className="flex flex-wrap gap-1.5 px-4 pb-2.5">
          {Object.entries(cnt).map(([k, v]) => (
            <span key={k} className="rounded-full border border-cm-line bg-cm-surface2 px-2 py-0.5 text-[11px] text-cm-muted">
              {k}: <b className="text-cm-ink">{v}</b>
            </span>
          ))}
        </div>
        {iss.length ? (
          <>
            <TblBox>
              <Table>
                <thead>
                  <tr>
                    <th>Anomalia</th>
                    <th>Commessa</th>
                    <th>Dettaglio</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {iss.slice(0, 60).map((x, i) => (
                    <tr key={i}>
                      <td>{x.t}</td>
                      <td className="text-[10px]">{x.n}</td>
                      <td className="text-cm-muted">{x.d}</td>
                      <td>
                        {x.n && (
                          <Btn size="sm" aria-label="Apri scheda commessa" onClick={() => openModal(x.n)}>
                            <Pencil size={12} />
                          </Btn>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TblBox>
            {iss.length > 60 && <div className="px-4 py-2 text-[11px] text-cm-faint">…e altre {iss.length - 60}</div>}
          </>
        ) : (
          <div className="px-4 py-3 text-[12px] text-cm-ok">Nessuna anomalia rilevata</div>
        )}
      </Card>

      <Card title="Commesse critiche (ritardo > 30 gg)" bodyClass="px-0 py-0">
        <TblBox>
          <Table>
            <thead>
              <tr>
                <th>N. Commessa</th>
                <th>Cliente</th>
                <th>Concl. prevista</th>
                <th>Ritardo</th>
                <th>Scad. interna</th>
                <th>Owner</th>
                <th>Prio</th>
                <th>Bloccanti</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {crit.length ? (
                crit.map((r) => {
                  const g = G(r.n),
                    bl = openBlk(r);
                  return (
                    <tr key={r.n}>
                      <td className="max-w-[130px] truncate text-[10px]">{r.n}</td>
                      <td className="max-w-[130px] truncate">{r.cliente.slice(0, 24)}</td>
                      <td>{fmtD(r.concl)}</td>
                      <td className="font-semibold" style={{ color: r.ritardo > 90 ? P.bad : P.orange }}>
                        {r.ritardo} gg
                      </td>
                      <td style={{ color: P.info }}>{g.scadint || "—"}</td>
                      <td>
                        <RowOwner r={r} />
                      </td>
                      <td>
                        <PrioTag prio={g.prio} />
                      </td>
                      <td>
                        {bl > 0 ? (
                          <Badge kind="block">
                            <Construction size={11} />
                            {bl}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <Btn size="sm" aria-label="Apri scheda commessa" onClick={() => openModal(r.n)}>
                          <Pencil size={12} />
                        </Btn>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-5 text-center text-cm-faint">
                    Nessuna commessa critica
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TblBox>
      </Card>
    </div>
  );
}
