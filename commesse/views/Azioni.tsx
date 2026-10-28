import React, { useState } from "react";
import { CheckSquare, Plus, X } from "lucide-react";
import { S } from "../engine/state";
import { azioni, azOpen, azScad } from "../engine/calc";
import { addAzione, delAzione, toggleAzione } from "../engine/actions";
import type { Azione } from "../engine/types";
import { fmtD } from "../engine/util";
import { Btn, Card, FIELD, Kpi, KpiGrid, PageHeader } from "../ui/primitives";
import { RTable } from "../ui/rowtable";
import { P } from "../theme";
import { useS } from "../ui/useS";

export default function Azioni() {
  useS();
  const [t, setT] = useState("");
  const [who, setWho] = useState("");
  const [due, setDue] = useState("");
  const [n, setN] = useState("");

  const add = () => {
    if (addAzione({ t, who, due, n })) {
      setT("");
      setDue("");
      setN("");
    }
  };

  const A = azioni();
  const op = azOpen();
  const dn = A.filter((a) => a.done)
    .sort((x, y) => ((y.doneAt || "") < (x.doneAt || "") ? -1 : 1))
    .slice(0, 10);
  const sc = op.filter(azScad).length;

  const tb = (r: Azione[]) => (
    <RTable
      head={[<span className="sr-only">Fatta</span>, "Azione", "Chi", "Entro", "Commessa", "Creata", <span className="sr-only">Elimina</span>]}
      empty="Nessuna azione."
      rows={r.map((a) => [
        <input
          type="checkbox"
          className="h-4 w-4 cursor-pointer accent-[#22d3ee]"
          checked={a.done}
          aria-label={"Segna come fatta: " + a.t}
          onChange={() => toggleAzione(a.id)}
        />,
        a.t,
        a.who || "—",
        <span className={azScad(a) ? "font-semibold text-cm-bad" : ""}>{a.due ? fmtD(new Date(a.due + "T00:00:00")) : "—"}</span>,
        a.n || "—",
        (a.wk || "") + " · " + new Date(a.created).toLocaleDateString("it-IT"),
        <Btn variant="d" size="sm" aria-label={"Elimina azione: " + a.t} onClick={() => delAzione(a.id)}>
          <X size={12} />
        </Btn>,
      ])}
    />
  );

  return (
    <div>
      <PageHeader
        icon={<CheckSquare size={22} />}
        title="Azioni di riunione"
        desc="Le decisioni prese in riunione: cosa, chi, entro quando. Quelle aperte compaiono nel report successivo."
      />
      <Card title="Nuova azione">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input
            type="text"
            className={`${FIELD} min-w-[240px] flex-1`}
            placeholder="Cosa va fatto..."
            aria-label="Cosa va fatto"
            value={t}
            onChange={(e) => setT(e.target.value)}
          />
          <select className={FIELD} aria-label="Chi" value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="">Chi?</option>
            {(S.cfg.owners || []).map((o) => (
              <option key={o.id} value={o.name}>
                {o.name}
              </option>
            ))}
            <option value="Altro">Altro</option>
          </select>
          <input type="date" className={FIELD} title="Entro quando" aria-label="Entro quando" value={due} onChange={(e) => setDue(e.target.value)} />
          <input
            type="text"
            className={`${FIELD} w-[170px]`}
            placeholder="Commessa (facoltativo)"
            aria-label="Commessa (facoltativo)"
            value={n}
            onChange={(e) => setN(e.target.value)}
          />
          <Btn variant="p" type="submit">
            <Plus size={14} /> Aggiungi
          </Btn>
        </form>
      </Card>
      <KpiGrid>
        <Kpi label="Da fare" value={op.length} sub="azioni ancora aperte" color={op.length ? P.orange : P.ok} />
        <Kpi label="Scadute" value={sc} sub={sc ? "oltre la data prevista" : "nessuna scaduta"} color={sc ? P.bad : P.ok} />
        <Kpi label="Chiuse" value={A.length - op.length} sub="in totale" color={P.ok} />
      </KpiGrid>
      <Card title="Da fare">{tb(op)}</Card>
      <Card title="Chiuse di recente">{tb(dn)}</Card>
    </div>
  );
}
