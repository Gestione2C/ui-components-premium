import React from "react";
import { BarChart3 } from "lucide-react";
import { S, cwRowsCompletate, cwRowsOpen, getWKs, isDone } from "../engine/state";
import { Card, Delta, Kpi, Legend, PageHeader, WkBar } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick } from "../ui/Chart";
import { P } from "../theme";
import { useS } from "../ui/useS";

const barOpts = (xFont?: number) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: tick, grid: gridY },
    x: { ticks: xFont ? { ...tick, font: { size: xFont } } : tick, grid: noGrid },
  },
});
const donutOpts = { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: { display: false } } };

export default function Panoramica() {
  useS();
  const rows = cwRowsOpen();
  const n = rows.length;
  if (!n) return <PageHeader icon={<BarChart3 size={22} />} title="Panoramica" right={<WkBar />} />;

  const completate = cwRowsCompletate().length;
  const inRit = rows.filter((r) => r.in_ritardo).length;
  const parz = rows.filter((r) => r.stato_key === "parz").length;
  const parzOk = rows.filter((r) => r.stato_key === "parz" && !r.in_ritardo).length;
  const nodata = rows.filter((r) => r.stato_key === "nodata").length;
  const ritRows = rows.filter((r) => r.in_ritardo && r.ritardo > 0);
  const ritMed = ritRows.length ? Math.round(ritRows.reduce((s, r) => s + r.ritardo, 0) / ritRows.length) : 0;
  const withAge = rows.filter((r) => r.gg_apertura != null);
  const etaMed = withAge.length ? Math.round(withAge.reduce((s, r) => s + (r.gg_apertura as number), 0) / withAge.length) : 0;
  const blkOpen = Object.values(S.gestione).reduce((s, g) => s + (g.blocks?.filter((b) => !b.resolved).length || 0), 0);
  const wks = getWKs();
  const prevWK = wks[wks.indexOf(S.wk as string) - 1];
  const prev = prevWK ? S.rows.filter((r) => !isDone(r) && r.wk === prevWK) : null;
  const dt = (cur: number, old: number | undefined, inv = false) => <Delta cur={cur} old={old} inv={inv} prev={prevWK} />;
  const ritCol = inRit / n > 0.5 ? P.bad : inRit / n > 0.3 ? P.orange : P.accent;

  // Stato donut
  const stMap: Record<string, number> = {};
  rows.forEach((r) => {
    const k = r.stato.includes("Parz") ? "Parz. concluso" : !r.concl ? "Senza data" : "Confermato";
    stMap[k] = (stMap[k] || 0) + 1;
  });
  const stC: Record<string, string> = { Confermato: P.accent, "Parz. concluso": P.info, "Senza data": P.warn };

  // Scadenze donut
  const sNT = rows.filter((r) => r.stato_key === "ok").length;
  const scad = [
    { l: "Nei tempi", c: P.ok, v: sNT },
    { l: "In ritardo", c: P.bad, v: inRit },
    { l: "Parz.", c: P.info, v: parzOk },
    { l: "Senza data", c: P.warn, v: nodata },
  ];

  // Top clienti
  const cMap: Record<string, number> = {};
  rows.forEach((r) => (cMap[r.cliente] = (cMap[r.cliente] || 0) + 1));
  const topC = Object.entries(cMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Anzianità
  const ab: Record<string, number> = { "0-15": 0, "16-30": 0, "31-60": 0, "61-90": 0, "91-180": 0, "180+": 0 };
  withAge.forEach((r) => {
    const d = r.gg_apertura as number;
    if (d <= 15) ab["0-15"]++;
    else if (d <= 30) ab["16-30"]++;
    else if (d <= 60) ab["31-60"]++;
    else if (d <= 90) ab["61-90"]++;
    else if (d <= 180) ab["91-180"]++;
    else ab["180+"]++;
  });

  return (
    <div>
      <PageHeader
        icon={<BarChart3 size={22} />}
        title="Panoramica"
        desc="Quadro generale delle commesse aperte: quante sono, quante in ritardo e dove stanno i problemi."
        right={<WkBar />}
      />
      <div className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5">
        <Kpi label="Commesse aperte" value={n} sub={dt(n, prev?.length, true)} color={ritCol} />
        <Kpi label="Completate" value={completate} color={P.ok} />
        <Kpi label="In ritardo" value={inRit} sub={dt(inRit, prev?.filter((r) => r.in_ritardo).length, true)} color={P.bad} />
        <Kpi label="% Ritardo" value={n ? Math.round((inRit / n) * 100) + "%" : "—"} color={inRit / n > 0.5 ? P.bad : inRit / n > 0.3 ? P.orange : P.ok} />
        <Kpi label="Ritardo medio" value={ritMed + " gg"} color={P.orange} />
        <Kpi label="Età media" value={etaMed + " gg"} color={P.info} />
        <Kpi label="Parz. concluse" value={parz} color={P.info} />
        <Kpi label="Senza data concl." value={nodata} color={P.orange} />
        <Kpi label="Bloccanti aperti" value={blkOpen} color={blkOpen > 0 ? P.bad : P.ok} />
      </div>

      {/* composizione bento: tessere di dimensione diversa */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
        <Card className="lg:col-span-2" title="Stato commesse" right={<Legend items={Object.entries(stMap).map(([k, v]) => ({ color: stC[k] || P.mute, label: `${k} (${v})` }))} />}>
          <ChartCanvas
            height={190}
            label="Stato commesse"
            config={{
              type: "doughnut",
              data: { labels: Object.keys(stMap), datasets: [{ data: Object.values(stMap), backgroundColor: Object.keys(stMap).map((k) => stC[k] || P.mute), borderWidth: 0 }] },
              options: donutOpts,
            }}
          />
        </Card>
        <Card className="lg:col-span-2" title="Rispetto scadenze" right={<Legend items={scad.map((s) => ({ color: s.c, label: `${s.l} (${s.v})` }))} />}>
          <ChartCanvas
            height={190}
            label="Rispetto scadenze"
            config={{
              type: "doughnut",
              data: { labels: scad.map((s) => s.l), datasets: [{ data: scad.map((s) => s.v), backgroundColor: scad.map((s) => s.c), borderWidth: 0 }] },
              options: donutOpts,
            }}
          />
        </Card>
        <Card className="lg:col-span-2" title="Distribuzione anzianità commesse (giorni)">
          <ChartCanvas
            height={190}
            label="Anzianità commesse"
            config={{
              type: "bar",
              data: { labels: Object.keys(ab), datasets: [{ data: Object.values(ab), backgroundColor: [P.ok, P.accent, P.info, P.warn, P.orange, P.bad], borderRadius: 4, borderSkipped: false }] },
              options: barOpts(),
            }}
          />
        </Card>
        <Card className="lg:col-span-6" title="Top clienti">
          <ChartCanvas
            height={230}
            label="Top clienti"
            config={{
              type: "bar",
              data: {
                labels: topC.map(([k]) => (k.length > 26 ? k.slice(0, 26) + "…" : k)),
                datasets: [{ data: topC.map(([, v]) => v), backgroundColor: P.accent, borderRadius: 4, borderSkipped: false }],
              },
              options: barOpts(11),
            }}
          />
        </Card>
      </div>
    </div>
  );
}
