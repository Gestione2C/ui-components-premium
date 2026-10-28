import { TrendingUp } from "lucide-react";
import { S, getWKs, isDone } from "../engine/state";
import { Badge, Card, Legend, PageHeader, Table, TblBox } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick, valLabels } from "../ui/Chart";
import { P } from "../theme";
import { useS } from "../ui/useS";

export default function Trend() {
  useS();
  const wks = getWKs();
  const tot = wks.map((w) => S.rows.filter((r) => !isDone(r) && r.wk === w).length);
  const rit = wks.map((w) => S.rows.filter((r) => !isDone(r) && r.wk === w && r.in_ritardo).length);
  const pz = wks.map((w) => S.rows.filter((r) => !isDone(r) && r.wk === w && r.stato_key === "parz").length);
  const pct = wks.map((_, i) => (tot[i] ? Math.round((rit[i] / tot[i]) * 100) : 0));
  const rm = wks.map((w) => {
    const rr = S.rows.filter((r) => !isDone(r) && r.wk === w && r.in_ritardo && r.ritardo > 0);
    return rr.length ? Math.round(rr.reduce((s, r) => s + r.ritardo, 0) / rr.length) : 0;
  });

  const few = wks.length < 4;
  const C = { t: P.accent, r: P.bad, p: P.info };
  const ds = (label: string, data: number[], c: string, dash?: number[]) =>
    few
      ? { label, data, backgroundColor: c, borderRadius: 6, borderSkipped: false, maxBarThickness: 46 }
      : { label, data, borderColor: c, backgroundColor: "rgba(0,0,0,0)", tension: 0.3, pointRadius: 5, pointBackgroundColor: c, borderDash: dash || [], fill: false };

  const trendConfig = {
    type: few ? "bar" : "line",
    plugins: few ? [valLabels] : [],
    data: { labels: wks, datasets: [ds("Totale", tot, C.t), ds("In ritardo", rit, C.r, [6, 4]), ds("Parz.", pz, C.p, [2, 4])] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, valLabels: {} },
      scales: { y: { min: 0, grace: "15%", ticks: { ...tick, precision: 0 }, grid: gridY }, x: { ticks: tick, grid: noGrid } },
    },
  };
  const tassoConfig = {
    type: "bar",
    data: {
      labels: wks,
      datasets: [{ data: pct, backgroundColor: pct.map((p) => (p > 60 ? P.bad : p > 40 ? P.orange : P.ok)), borderRadius: 5, borderSkipped: false }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100, ticks: { ...tick, callback: (v: any) => v + "%" }, grid: gridY }, x: { ticks: tick, grid: noGrid } },
    },
  };
  const rmedConfig = {
    type: "line",
    data: {
      labels: wks,
      datasets: [{ data: rm, borderColor: P.orange, backgroundColor: P.orange + "12", fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: P.orange }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: tick, grid: gridY }, x: { ticks: tick, grid: noGrid } },
    },
  };

  return (
    <div>
      <PageHeader icon={<TrendingUp size={22} />} title="Trend Settimanale" desc="Come evolvono ritardi e commesse aperte settimana dopo settimana." />
      <Card
        title="Commesse aperte WK per WK"
        right={<Legend items={[{ color: C.t, label: "Totale" }, { color: C.r, label: "In ritardo" }, { color: C.p, label: "Parz." }]} />}
      >
        <div style={few ? { maxWidth: 560, margin: "0 auto" } : undefined}>
          <ChartCanvas height={few ? 230 : 260} label="Commesse aperte settimana per settimana" config={trendConfig} />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card title="Tasso ritardo %">
          <ChartCanvas height={200} label="Tasso ritardo percentuale" config={tassoConfig} />
        </Card>
        <Card title="Ritardo medio (gg)">
          <ChartCanvas height={200} label="Ritardo medio in giorni" config={rmedConfig} />
        </Card>
      </div>
      <Card title="Tabella KPI settimanali" bodyClass="px-0">
        <TblBox>
          <Table>
            <thead>
              <tr>
                <th>WK</th>
                <th>Totale</th>
                <th>In ritardo</th>
                <th>% Ritardo</th>
                <th>Parz.</th>
                <th>Rit. medio</th>
              </tr>
            </thead>
            <tbody>
              {wks.map((w, i) => (
                <tr key={w}>
                  <td>{w}</td>
                  <td>{tot[i]}</td>
                  <td>{rit[i]}</td>
                  <td>
                    <Badge kind={pct[i] > 60 ? "danger" : pct[i] > 40 ? "warn" : "ok"}>{pct[i]}%</Badge>
                  </td>
                  <td>{pz[i]}</td>
                  <td>{rm[i]} gg</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TblBox>
      </Card>
    </div>
  );
}
