import React, { useState } from "react";
import { GitCompare } from "lucide-react";
import { getWKs } from "../engine/state";
import { CMP_ORDER, cmpWeeks } from "../engine/calc";
import { Card, FIELD, PageHeader } from "../ui/primitives";
import { RTable } from "../ui/rowtable";
import { useS } from "../ui/useS";

export default function Confronto() {
  useS();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const wks = getWKs();
  const head = (
    <PageHeader
      icon={<GitCompare size={22} />}
      title="Confronto tra settimane"
      desc="Cosa è cambiato tra due settimane: commesse nuove, concluse e date spostate."
    />
  );
  const sa = wks.includes(a) ? a : wks[wks.length - 2],
    sb = wks.includes(b) ? b : wks[wks.length - 1];
  const none = wks.length < 2;
  const L = none ? [] : cmpWeeks(sa, sb),
    cnt: Record<string, number> = {};
  L.forEach((x) => (cnt[x.t] = (cnt[x.t] || 0) + 1));
  const sum = CMP_ORDER.filter((t) => cnt[t]);
  const opts = wks.map((w) => (
    <option key={w} value={w}>
      {w}
    </option>
  ));
  return (
    <div>
      {head}
      <div className="no-print mb-3 flex flex-wrap items-center gap-2 text-xs text-cm-muted">
        <label htmlFor="cmp-a">Da</label>
        <select
          id="cmp-a"
          className={FIELD}
          value={sa}
          onChange={(e) => setA(e.target.value)}
        >
          {opts}
        </select>
        <label htmlFor="cmp-b">A</label>
        <select
          id="cmp-b"
          className={FIELD}
          value={sb}
          onChange={(e) => setB(e.target.value)}
        >
          {opts}
        </select>
      </div>
      {none ? (
        <div className="p-6 text-[13px] text-cm-faint">
          Servono almeno due settimane caricate (un file per settimana, es. WK39
          e WK40).
        </div>
      ) : (
        <>
          <div className="my-3 flex flex-wrap gap-2">
            {sum.length ? (
              sum.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-cm-line bg-cm-surface2 px-2.5 py-1 text-xs text-cm-muted"
                >
                  {t}: <b className="text-cm-ink">{cnt[t]}</b>
                </span>
              ))
            ) : (
              <span className="text-xs text-cm-faint">Nessuna variazione.</span>
            )}
          </div>
          <Card
            title={
              <>
                Variazioni <span className="text-cm-faint">({L.length})</span>
              </>
            }
          >
            <RTable
              head={["Variazione", "Commessa", "Cliente", "Dettaglio"]}
              rows={L.slice(0, 150).map((x) => [
                x.t,
                <span className="text-[10px]">{x.n}</span>,
                <span
                  className="block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
                  title={x.cli}
                >
                  {x.cli}
                </span>,
                <span className="text-cm-muted">{x.d}</span>,
              ])}
            />
          </Card>
        </>
      )}
    </div>
  );
}
