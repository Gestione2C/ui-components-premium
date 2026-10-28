import React from "react";
import { Construction, Factory } from "lucide-react";
import { G, S, areaOf, cwRowsOpen, ownerIdOf } from "../engine/state";
import { AreaChip, Card, Kpi, KpiGrid, OwnerAvatar, PageHeader, ritColor, WkBar } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick } from "../ui/Chart";
import { openModal } from "../ui/overlays";
import { P } from "../theme";
import { useS } from "../ui/useS";
import type { Row } from "../engine/types";

const openBlk = (r: Row) => (G(r.n).blocks || []).filter((b) => !b.resolved).length;

export default function Produzione() {
  useS();
  const rows = cwRowsOpen();
  const areaMap: Record<string, Row[]> = {};
  S.cfg.areas.forEach((a) => (areaMap[a] = []));
  areaMap["Non assegnata"] = [];
  rows.forEach((r) => {
    const a = areaOf(r) || "Non assegnata";
    if (!areaMap[a]) areaMap[a] = [];
    areaMap[a].push(r);
  });
  const assigned = rows.filter((r) => areaOf(r)).length;
  const withBlk = rows.filter((r) => openBlk(r) > 0).length;
  const cols = Object.entries(areaMap).filter(([, v]) => v.length > 0);
  const aNames = cols.map(([a]) => a);
  const aCounts = cols.map(([, v]) => v.length);
  const aBlk = cols.map(([, v]) => v.filter((r) => openBlk(r) > 0).length);

  return (
    <div>
      <PageHeader
        icon={<Factory size={22} />}
        title="Aree di Produzione"
        desc="Come procede la produzione: righe d'ordine e carico per reparto."
        right={<WkBar />}
      />
      <KpiGrid>
        <Kpi label="Totale WK" value={rows.length} color={P.accent} />
        <Kpi label="Assegnate ad area" value={assigned} color={assigned === rows.length ? P.ok : P.orange} />
        <Kpi label="Non assegnate" value={rows.length - assigned} color={rows.length - assigned > 0 ? P.orange : P.ok} />
        <Kpi label="Con bloccanti aperti" value={withBlk} color={withBlk > 0 ? P.bad : P.ok} />
      </KpiGrid>

      <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
        {cols.map(([area, rs]) => {
          const wb = rs.filter((r) => openBlk(r) > 0).length;
          return (
            <div key={area} className="flex max-h-[520px] w-[220px] shrink-0 flex-col rounded-xl border border-cm-line bg-cm-surface">
              <div className="flex items-center justify-between gap-2 border-b border-cm-line px-3 py-2">
                <AreaChip area={area} small />
                <span className="num flex items-center gap-1.5 text-[10px] text-cm-muted">
                  {rs.length}
                  {wb > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-cm-bad">
                      · <Construction size={11} />
                      {wb}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto p-2">
                {rs.map((r) => {
                  const bl = openBlk(r);
                  const oid = ownerIdOf(r);
                  const ow = S.cfg.owners.find((o) => o.id === oid);
                  return (
                    <button
                      key={r.n}
                      type="button"
                      onClick={() => openModal(r.n)}
                      className="cursor-pointer rounded-lg border border-cm-line2 bg-cm-surface2 p-2.5 text-left transition-colors duration-150 hover:border-cm-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-cm-accent"
                    >
                      <div className="num truncate text-[11px] font-semibold">{r.n.slice(0, 24)}</div>
                      <div className="truncate text-[10.5px] text-cm-muted">{r.cliente.slice(0, 26)}</div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="num text-[10px]" style={{ color: ritColor(r) }}>
                          {r.ritardo != null ? r.ritardo + "gg" : "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {ow && <OwnerAvatar id={ow.id} size={16} text={7} />}
                          {bl > 0 && (
                            <span className="num inline-flex items-center gap-0.5 text-[10px] text-cm-bad">
                              <Construction size={11} />
                              {bl}
                            </span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Card title="Carico per area (commesse · bloccanti)">
        <ChartCanvas
          height={240}
          label="Carico per area"
          config={{
            type: "bar",
            data: {
              labels: aNames,
              datasets: [
                { label: "Senza bloccanti", data: aNames.map((_, i) => aCounts[i] - aBlk[i]), backgroundColor: P.accent, borderRadius: [0, 0, 4, 4], borderSkipped: false, stack: "s" },
                { label: "Con bloccanti", data: aBlk, backgroundColor: P.bad, borderRadius: [4, 4, 0, 0], borderSkipped: false, stack: "s" },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: P.tick, font: { size: 11 }, boxWidth: 10 } } },
              scales: {
                y: { beginAtZero: true, stacked: true, ticks: tick, grid: gridY },
                x: { stacked: true, ticks: { ...tick, font: { size: 11 } }, grid: noGrid },
              },
            },
          }}
        />
      </Card>
    </div>
  );
}
