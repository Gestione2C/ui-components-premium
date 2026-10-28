import { Building2 } from "lucide-react";
import { cwRowsOpen } from "../engine/state";
import { Badge, Card, PageHeader, Table, TblBox, WkBar } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick } from "../ui/Chart";
import { P } from "../theme";
import { useS } from "../ui/useS";

export default function Clienti() {
  useS();
  const rows = cwRowsOpen();
  const cm: Record<string, { tot: number; rit: number; parz: number; nd: number }> = {};
  rows.forEach((r) => {
    if (!cm[r.cliente]) cm[r.cliente] = { tot: 0, rit: 0, parz: 0, nd: 0 };
    cm[r.cliente].tot++;
    if (r.in_ritardo) cm[r.cliente].rit++;
    if (r.stato_key === "parz" && !r.in_ritardo) cm[r.cliente].parz++;
    if (r.stato_key === "nodata") cm[r.cliente].nd++;
  });
  const sorted = Object.entries(cm).sort((a, b) => b[1].tot - a[1].tot);

  const config = {
    type: "bar",
    data: {
      labels: sorted.map(([k]) => (k.length > 30 ? k.slice(0, 30) + "…" : k)),
      datasets: [
        { label: "Nei tempi", data: sorted.map(([, v]) => v.tot - v.rit - v.parz - v.nd), backgroundColor: P.ok, stack: "s" },
        { label: "In ritardo", data: sorted.map(([, v]) => v.rit), backgroundColor: P.bad, stack: "s" },
        { label: "Parz.", data: sorted.map(([, v]) => v.parz), backgroundColor: P.info, stack: "s" },
        { label: "Senza data", data: sorted.map(([, v]) => v.nd), backgroundColor: P.warn, stack: "s" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: { legend: { labels: { color: P.tick, font: { size: 11 }, boxWidth: 10 } } },
      scales: {
        x: { beginAtZero: true, stacked: true, ticks: tick, grid: gridY },
        y: { stacked: true, ticks: { ...tick, font: { size: 11 } }, grid: noGrid },
      },
    },
  };

  return (
    <div>
      <PageHeader
        icon={<Building2 size={22} />}
        title="Analisi Clienti"
        desc="Situazione per cliente: chi ha più commesse e più ritardi."
        right={<WkBar />}
      />
      <Card title="Commesse per cliente">
        <ChartCanvas height={320} label="Commesse per cliente" config={config} />
      </Card>
      <Card title="Tabella clienti" bodyClass="px-0">
        <TblBox>
          <Table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Commesse</th>
                <th>In ritardo</th>
                <th>% Rit.</th>
                <th>Esposizione</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(([n, v]) => {
                const p = Math.round((v.rit / v.tot) * 100);
                return (
                  <tr key={n}>
                    <td>{n}</td>
                    <td>{v.tot}</td>
                    <td>{v.rit}</td>
                    <td>{p}%</td>
                    <td>
                      <Badge kind={v.tot >= 10 ? "danger" : v.tot >= 5 ? "warn" : "ok"}>{v.tot >= 10 ? "Critica" : v.tot >= 5 ? "Alta" : "Normale"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TblBox>
      </Card>
    </div>
  );
}
