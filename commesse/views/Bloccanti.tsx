import React, { useState } from "react";
import { Check, CircleHelp, Construction, FileText, Factory, Package, Pencil, Settings, Undo2, User, X } from "lucide-react";
import { G, S, cwRows } from "../engine/state";
import { computeSug } from "../engine/calc";
import { addAllSug, addSug, ignoreSug, quickToggleBlk } from "../engine/actions";
import { BLK_LABEL, BLK_TIPI } from "../engine/constants";
import { Badge, Btn, Card, FIELD, PageHeader, Stat, Table, TblBox, WkBar } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick } from "../ui/Chart";
import { openModal } from "../ui/overlays";
import { P } from "../theme";
import { useS } from "../ui/useS";

const TIPO_ICON: Record<string, React.ReactNode> = {
  MATERIALE: <Package size={13} />,
  CLIENTE: <User size={13} />,
  FORNITORE: <Factory size={13} />,
  TECNICO: <Settings size={13} />,
  DOCUMENTO: <FileText size={13} />,
  ALTRO: <CircleHelp size={13} />,
};
const icon = (t?: string) => TIPO_ICON[t || ""] || TIPO_ICON.ALTRO;
const TIPO_COLORS = [P.accent, P.info, P.warn, P.orange, P.ok, P.mute];

const barOpts = (xFont: number) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: tick, grid: gridY },
    x: { ticks: { ...tick, font: { size: xFont } }, grid: noGrid },
  },
});

export default function Bloccanti() {
  useS();
  const [tf, setTf] = useState("all");
  const [of, setOf] = useState("1");

  const sug = computeSug();
  const rows = cwRows();
  const allBlocks: any[] = [];
  rows.forEach((r) => {
    (G(r.n).blocks || []).forEach((b) => allBlocks.push({ ...b, row: r }));
  });
  let filtered = allBlocks;
  if (tf !== "all") filtered = filtered.filter((b) => b.tipo === tf);
  if (of === "1") filtered = filtered.filter((b) => !b.resolved);

  const totOpen = allBlocks.filter((b) => !b.resolved).length;
  const totAll = allBlocks.length;
  const totRes = allBlocks.filter((b) => b.resolved).length;
  const byT: Record<string, number> = {};
  allBlocks.filter((b) => !b.resolved).forEach((b) => (byT[b.tipo] = (byT[b.tipo] || 0) + 1));

  const tipos = [...BLK_TIPI] as string[];
  const perN: Record<string, number> = {};
  rows.forEach((r) => {
    const bl = (G(r.n).blocks || []).filter((b) => !b.resolved).length;
    if (bl > 0) perN[r.n.slice(0, 16)] = bl;
  });
  const topN = Object.entries(perN).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div>
      <PageHeader
        icon={<Construction size={22} />}
        title="Condizioni Bloccanti"
        desc="Tutto ciò che ferma le commesse: cosa manca, di chi è la responsabilità, da quanto è aperto."
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <Stat>
          <Construction size={13} /> Aperti: <strong>{totOpen}</strong>
        </Stat>
        <Stat>
          <Check size={13} /> Risolti: <strong>{totRes}</strong>
        </Stat>
        <Stat>
          Totale: <strong>{totAll}</strong>
        </Stat>
        {Object.entries(byT).map(([t, v]) => (
          <Stat key={t}>
            {icon(t)} {t}: <strong>{v}</strong>
          </Stat>
        ))}
      </div>

      {sug.length > 0 && (
        <Card
          title={`Bloccanti suggeriti dai commenti (${sug.length})`}
          bodyClass="px-0 pb-0"
          right={
            <Btn variant="p" size="sm" onClick={() => addAllSug(sug)}>
              <Check size={13} /> Aggiungi tutti
            </Btn>
          }
        >
          <TblBox>
            <Table>
              <thead>
                <tr>
                  <th>Commessa</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Motivo</th>
                  <th>Scad.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sug.slice(0, 40).map((x, i) => (
                  <tr key={x.r.n + x.tipo}>
                    <td className="text-[10px]">{x.r.n}</td>
                    <td className="max-w-[130px] truncate">{x.r.cliente}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5">
                        {icon(x.tipo)} {x.tipo}
                      </span>
                    </td>
                    <td className="max-w-[380px] text-cm-muted">{x.desc}</td>
                    <td>{x.scad ? x.scad.split("-").reverse().join("/") : "—"}</td>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex gap-1.5">
                        <Btn size="sm" onClick={() => addSug(x, i)}>
                          <Check size={12} /> Aggiungi
                        </Btn>
                        <Btn variant="d" size="sm" title="Non suggerire più" aria-label="Non suggerire più" onClick={() => ignoreSug(x)}>
                          <X size={12} />
                        </Btn>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TblBox>
          {sug.length > 40 && <div className="px-4 py-2 text-[11px] text-cm-faint">…e altri {sug.length - 40}: gestisci quelli sopra per vederli.</div>}
        </Card>
      )}

      <div className="no-print mb-3 flex flex-wrap items-center gap-2.5">
        <WkBar />
        <label htmlFor="bf-tipo" className="text-xs text-cm-muted">
          Tipo
        </label>
        <select id="bf-tipo" className={FIELD} value={tf} onChange={(e) => setTf(e.target.value)}>
          <option value="all">Tutti</option>
          {BLK_TIPI.map((t) => (
            <option key={t} value={t}>
              {BLK_LABEL[t]}
            </option>
          ))}
        </select>
        <label htmlFor="bf-open" className="text-xs text-cm-muted">
          Stato
        </label>
        <select id="bf-open" className={FIELD} value={of} onChange={(e) => setOf(e.target.value)}>
          <option value="1">Solo aperti</option>
          <option value="0">Tutti</option>
        </select>
        <span className="text-xs text-cm-faint">{filtered.length} bloccanti</span>
      </div>

      <Card bodyClass="px-0 py-0">
        <TblBox>
          <Table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Commessa</th>
                <th>Cliente</th>
                <th>Descrizione</th>
                <th>Scad. blocco</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((b) => (
                  <tr key={b.row.n + b.id}>
                    <td>
                      <Badge kind="block">
                        {icon(b.tipo)} {b.tipo || "ALTRO"}
                      </Badge>
                    </td>
                    <td className="max-w-[120px] truncate text-[10px]">{b.row.n}</td>
                    <td className="max-w-[130px] truncate">{b.row.cliente.slice(0, 24)}</td>
                    <td className="max-w-[200px] truncate">{b.desc || "—"}</td>
                    <td className={b.scad && new Date(b.scad) < S.refDate ? "text-cm-bad" : "text-cm-muted"}>{b.scad || "—"}</td>
                    <td>
                      <Badge kind={b.resolved ? "ok" : "danger"}>{b.resolved ? "Risolto" : "Aperto"}</Badge>
                    </td>
                    <td>
                      <span className="inline-flex gap-1">
                        <Btn
                          size="sm"
                          aria-label={b.resolved ? "Riapri bloccante" : "Segna come risolto"}
                          onClick={() => quickToggleBlk(b.row.n, b.id)}
                        >
                          {b.resolved ? <Undo2 size={12} /> : <Check size={12} />}
                        </Btn>
                        <Btn size="sm" aria-label="Apri scheda commessa" onClick={() => openModal(b.row.n)}>
                          <Pencil size={12} />
                        </Btn>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-5 text-center text-cm-faint">
                    Nessuna condizione bloccante {of === "1" ? "aperta" : ""} trovata
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TblBox>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card title="Bloccanti aperti per tipo">
          <ChartCanvas
            height={200}
            label="Bloccanti aperti per tipo"
            config={{
              type: "bar",
              data: {
                labels: tipos,
                datasets: [
                  {
                    data: tipos.map((t) => allBlocks.filter((b) => !b.resolved && b.tipo === t).length),
                    backgroundColor: TIPO_COLORS,
                    borderRadius: 4,
                    borderSkipped: false,
                  },
                ],
              },
              options: barOpts(10),
            }}
          />
        </Card>
        <Card title="Bloccanti per commessa (top 10)">
          <ChartCanvas
            height={200}
            label="Bloccanti per commessa"
            config={{
              type: "bar",
              data: {
                labels: topN.map(([k]) => k),
                datasets: [{ data: topN.map(([, v]) => v), backgroundColor: P.bad, borderRadius: 4, borderSkipped: false }],
              },
              options: barOpts(9),
            }}
          />
        </Card>
      </div>
    </div>
  );
}
