import React, { useState } from "react";
import { Printer, Receipt } from "lucide-react";
import { G, S, areaOf, cwRows, isDone, ownerName } from "../engine/state";
import { fmtD } from "../engine/util";
import { Btn, Card, FIELD, Kpi, KpiGrid, PageHeader } from "../ui/primitives";
import { RTable } from "../ui/rowtable";
import { P } from "../theme";
import { useS } from "../ui/useS";

export default function Scheda() {
  useS();
  const [sel, setSel] = useState("");
  const desc = "Una pagina per cliente, pronta da stampare per gli incontri con quel cliente.";
  if (!S.rows.length) return <PageHeader icon={<Receipt size={22} />} title="Scheda cliente" desc={desc} />;

  const rows = cwRows(),
    cl = [...new Set(rows.map((r) => r.cliente))].sort();
  const c = cl.includes(sel) ? sel : cl[0] || "";
  const mine = rows.filter((r) => r.cliente === c),
    op = mine
      .filter((r) => !isDone(r))
      .sort((a, b) => (b.in_ritardo ? b.ritardo : -1) - (a.in_ritardo ? a.ritardo : -1));
  const ob = (n: string) => (G(n).blocks || []).filter((b) => !b.resolved),
    nb = op.reduce((a, r) => a + ob(r.n).length, 0),
    lt = op.filter((r) => r.in_ritardo).length;

  return (
    <div>
      <PageHeader
        icon={<Receipt size={22} />}
        title="Scheda cliente"
        desc={desc}
        right={
          <div className="no-print flex gap-2">
            <select className={`${FIELD} min-w-[240px]`} aria-label="Cliente" value={c} onChange={(e) => setSel(e.target.value)}>
              {cl.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            <Btn variant="p" onClick={() => window.print()}>
              <Printer size={14} /> Stampa
            </Btn>
          </div>
        }
      />
      <div className="mb-3 mt-1 text-base font-bold">
        Scheda cliente: {c}{" "}
        <span className="text-xs font-normal text-cm-faint">
          · {S.wk} · {fmtD(S.refDate)}
        </span>
      </div>
      <KpiGrid>
        <Kpi label="Commesse aperte" value={op.length} sub={`su ${mine.length} totali`} color={P.accent} />
        <Kpi label="In ritardo" value={lt} sub={op.length ? Math.round((100 * lt) / op.length) + "% delle aperte" : "—"} color={lt ? P.bad : P.ok} />
        <Kpi label="Bloccanti aperti" value={nb} sub={nb ? "da sbloccare" : "nessuno"} color={nb ? P.orange : P.ok} />
        <Kpi label="Concluse" value={mine.length - op.length} sub="in questo elenco" color={P.ok} />
      </KpiGrid>
      <Card title="Commesse aperte">
        <RTable
          head={["Commessa", "Fine prevista", "Ritardo", "Stato", "Area", "Owner", "Bloccanti / note"]}
          rows={
            op.length
              ? op.map((r) => {
                  const bs = ob(r.n);
                  return [
                    r.n.slice(0, 26),
                    fmtD(r.concl),
                    <span className={r.in_ritardo ? "font-semibold text-cm-bad" : ""}>{r.in_ritardo ? r.ritardo + " gg" : "—"}</span>,
                    r.stato,
                    areaOf(r) || "—",
                    ownerName(r),
                    <span className="text-[11px]">
                      {bs.length
                        ? bs.map((b, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <br />}
                              {`${String(b.tipo || "").toLowerCase()}: ${String(b.desc || "").replace(/[«»]/g, "").slice(0, 60)}`}
                            </React.Fragment>
                          ))
                        : String(r.commento || "").slice(0, 70)}
                    </span>,
                  ];
                })
              : [[<span key="e">Nessuna commessa aperta.</span>, "", "", "", "", "", ""]]
          }
        />
      </Card>
    </div>
  );
}
