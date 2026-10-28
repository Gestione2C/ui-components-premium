import React from "react";
import { Euro, Pencil } from "lucide-react";
import { S, cwRowsOpen } from "../engine/state";
import { prOf, valOf } from "../engine/calc";
import { eur, fmtD, lblM, mkM } from "../engine/util";
import { Btn, Card, Details, Empty, Highlight, Kpi, KpiGrid, Legend, Note, PageHeader, RowArea, Table, TblBox } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick } from "../ui/Chart";
import { openModal } from "../ui/overlays";
import { P } from "../theme";
import { useS } from "../ui/useS";

const f = (x: Date | null | undefined) => (x ? fmtD(x) : "—");

export default function Valore() {
  useS();
  const header = (
    <PageHeader
      icon={<Euro size={22} />}
      title="Valore commesse"
      desc="Quanto vale il lavoro aperto (in €), quanto è già finito e quanto resta da fare."
    />
  );
  const rows = cwRowsOpen().filter((r) => r.det);
  if (!rows.length) {
    return (
      <div id="page-valore">
        {header}
        <Empty>Carica insieme al file commesse anche il file delle righe d'ordine (foglio "Movimenti") per vedere valori e importi.</Empty>
      </div>
    );
  }
  const D = S.det || ({} as any);
  const V = rows.map((r) => ({ r, v: valOf(r) }));
  const nd = D.noDone && !D.nStati,
    fa = D.fatt;
  const T: Record<string, number> = V.reduce((a: Record<string, number>, x) => {
    for (const k in x.v) a[k] = (a[k] || 0) + (x.v as any)[k];
    return a;
  }, {});
  const ready = V.filter((x) => x.v.pa > 0 && x.v.po === x.v.pa).sort((a, b) => b.v.tot - a.v.tot);
  const cur = mkM(S.refDate);
  let ic = 0;
  rows.forEach((r) =>
    r.det!.rows.forEach((l) => {
      if (l.imp != null && l.scad && mkM(l.scad) === cur) ic += l.imp;
    }),
  );

  const M: Record<string, { pr: number; res: number }> = {};
  rows.forEach((r) =>
    r.det!.rows.forEach((l) => {
      if (l.imp == null) return;
      const k = l.scad ? l.scad.getFullYear() + "-" + String(l.scad.getMonth() + 1).padStart(2, "0") : "zz";
      const p = prOf(l);
      (M[k] = M[k] || { pr: 0, res: 0 });
      M[k].pr += p;
      M[k].res += l.imp - p;
    }),
  );
  const ks = Object.keys(M).sort();
  const lab = (k: string) =>
    k === "zz" ? "Senza mese" : new Date(+k.slice(0, 4), +k.slice(5) - 1, 1).toLocaleDateString("it-IT", { month: "short", year: "2-digit" });
  const top = [...V].sort((a, b) => b.v.res - a.v.res).slice(0, 12);

  const edit = (n: string) => (
    <Btn size="sm" aria-label={"Apri commessa " + n} title="Apri commessa" onClick={() => openModal(n)}>
      <Pencil size={12} />
    </Btn>
  );
  const note =
    (D.piano ? "Le percentuali per mese sono quelle dei responsabili di reparto nel Piano: 100% = riga pronta da consegnare. " : "") +
    (D.nStati ? `Nei fogli settimanali ${D.nStati} righe hanno anche uno stato (DONE, DELAY, BLOCKED…): DONE conta come completata.` : "");

  return (
    <div id="page-valore">
      {header}
      <div id="val-main">
        <Details summary="Cosa significano queste voci?">
          Questa pagina risponde a: <b>quanto vale ciò che dobbiamo ancora consegnare, quanto è già pronto e quanto resta da fare?</b> Gli importi (in €) vengono dal file Piano: ogni riga d'ordine ancora aperta, con il suo valore.
          <br />
          <b>Valore da consegnare</b>: somma delle righe ancora aperte (il "Piano a finire", senza il già fatturato).
          <br />
          <b>Impegnato dai reparti</b>: la parte del valore a cui i responsabili hanno assegnato un mese di consegna (anche i mesi futuri). Il resto non ha ancora un mese.
          <br />
          <b>Già completato</b>: la parte di ogni riga che il responsabile di reparto conferma di poter consegnare (percentuali Ott., Nov., Dic. del Piano), contata fino al mese in corso. 100% = riga pronta da consegnare. Contano anche le righe con stato DONE. Non è ancora fatturato.
          <br />
          <b>Ancora da fare</b>: tutto il resto: percentuali dei mesi futuri, righe senza mese, righe non ancora pronte.
          <br />
          <b>Commesse pronte da consegnare</b>: commesse in cui tutte le righe sono al 100% fino al mese in corso: si possono spedire e fatturare.
          <br />
          <b>Già fatturato</b>: quanto il file Piano indica come già fatturato nel periodo.
          <br />
          <b>Conto lavoro</b>: lavorazioni eseguite da fornitori esterni; è già compreso nel totale.
          <br />
          <b>Righe senza prezzo</b>: righe di cui non si conosce il valore, quindi non contate negli importi.
        </Details>

        {(ic > 0 || fa) && (
          <Highlight big={fa && ic ? Math.round((fa.v / ic) * 100) + "%" : "—"} color={P.accent}>
            <b>{lblM(cur)}</b>: i reparti hanno impegnato {eur(ic)} da consegnare nel mese
            {fa ? `; il file Piano indica già fatturati ${eur(fa.v)}` : ""}.
          </Highlight>
        )}

        <KpiGrid>
          <Kpi label="Valore da consegnare" value={eur(T.tot)} sub={`${rows.length} commesse aperte · ${T.nr} righe d'ordine non ancora consegnate`} color={P.accent} />
          <Kpi
            label="Impegnato dai reparti"
            value={eur(T.imp)}
            sub={`${T.tot ? Math.round((100 * T.imp) / T.tot) : 0}% del valore ha un mese di consegna · ${eur(T.tot - T.imp)} senza mese`}
            color={P.info}
          />
          {nd ? (
            <Kpi label="Già completato" value="n.d." sub="il file non indica quali righe sono finite" color={P.mute} />
          ) : (
            <Kpi label="Già completato" value={eur(T.pr)} sub={`quota che i reparti confermano di consegnare fino a ${lblM(cur)} (100% = riga pronta), non ancora fatturata`} color={P.ok} />
          )}
          {nd ? (
            <Kpi label="Ancora da fare" value="n.d." sub="dipende dalle righe completate" color={P.mute} />
          ) : (
            <Kpi label="Ancora da fare" value={eur(T.tot - T.pr)} sub="tutto il resto: in lavorazione, in ritardo, bloccato o senza stato" color={P.orange} />
          )}
          {nd ? (
            <Kpi label="Commesse pronte da consegnare" value="n.d." sub="servono le righe completate" color={P.mute} />
          ) : (
            <Kpi label="Commesse pronte da consegnare" value={ready.length} sub={eur(ready.reduce((a, x) => a + x.v.tot, 0)) + " · tutte le righe sono pronte"} color={P.ok} />
          )}
          {fa && <Kpi label="Già fatturato" value={eur(fa.v)} sub={'valore della riga "Fatturato" del file Piano'} color={P.accent} />}
          <Kpi label="Di cui conto lavoro" value={eur(T.cl)} sub="lavorazioni esterne, già nel totale" color={P.info} />
          <Kpi label="Righe senza prezzo" value={T.nop} sub={T.nop ? "non contate negli importi" : "tutte le righe hanno un prezzo"} color={T.nop ? P.orange : P.ok} />
        </KpiGrid>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
          <Card
            className="lg:col-span-6"
            title="Valore da consegnare, mese per mese (€)"
            right={<Legend items={[{ color: P.ok, label: "Già completato" }, { color: P.orange, label: "Ancora da fare" }]} />}
          >
            <ChartCanvas
              height={260}
              label="Valore da consegnare, mese per mese"
              config={{
                type: "bar",
                data: {
                  labels: ks.map(lab),
                  datasets: [
                    { label: "Già completato", data: ks.map((k) => Math.round(M[k].pr)), backgroundColor: P.ok, borderRadius: 4, maxBarThickness: 56 },
                    { label: "Ancora da fare", data: ks.map((k) => Math.round(M[k].res)), backgroundColor: P.orange, borderRadius: 4, maxBarThickness: 56 },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `${c.dataset.label}: ${eur(c.raw)}` } } },
                  scales: {
                    x: { stacked: true, ticks: tick, grid: noGrid },
                    y: { stacked: true, ticks: { ...tick, callback: (v: any) => (v >= 1000 ? v / 1000 + "k" : v) }, grid: gridY },
                  },
                },
              }}
            />
            <Note>
              Valore delle righe ancora da consegnare, nel mese in cui i reparti si sono impegnati. <span>{note}</span>
            </Note>
          </Card>

          <Card className="lg:col-span-6" title="Commesse con più lavoro ancora da fare" bodyClass="px-0 pb-1 pt-1">
            <TblBox>
              <Table>
                <thead>
                  <tr>
                    <th>Commessa</th>
                    <th>Cliente</th>
                    <th className="text-right">Totale</th>
                    <th className="text-right">Completato</th>
                    <th className="text-right">Ancora da fare</th>
                    <th>Prossima scad.</th>
                    <th>Area</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {top.map((x) => (
                    <tr key={x.r.n}>
                      <td className="text-[10px]">{x.r.n}</td>
                      <td className="max-w-[150px] truncate">{x.r.cliente}</td>
                      <td className="num text-right">{eur(x.v.tot)}</td>
                      <td className="num text-right text-cm-ok">{eur(x.v.pr)}</td>
                      <td className="num text-right font-semibold text-cm-orange">{eur(x.v.res)}</td>
                      <td>{f(x.r.det!.stats.prossima)}</td>
                      <td>
                        <RowArea r={x.r} small />
                      </td>
                      <td>{edit(x.r.n)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TblBox>
          </Card>

          <Card
            className="lg:col-span-6"
            title={
              <>
                Pronte da consegnare (righe al 100%) <span className="text-cm-faint">({ready.length})</span>
              </>
            }
            bodyClass="px-0 pb-1 pt-1"
          >
            {ready.length ? (
              <>
                <TblBox>
                  <Table>
                    <thead>
                      <tr>
                        <th>Commessa</th>
                        <th>Cliente</th>
                        <th className="text-right">Valore</th>
                        <th>Righe pronte</th>
                        <th>Scadenza</th>
                        <th>Area</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {ready.slice(0, 15).map((x) => (
                        <tr key={x.r.n}>
                          <td className="text-[10px]">{x.r.n}</td>
                          <td className="max-w-[150px] truncate">{x.r.cliente}</td>
                          <td className="num text-right">{eur(x.v.tot)}</td>
                          <td>
                            {x.v.nd}/{x.v.nr}
                          </td>
                          <td>{f(x.r.det!.stats.ultima)}</td>
                          <td>
                            <RowArea r={x.r} small />
                          </td>
                          <td>{edit(x.r.n)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TblBox>
                {ready.length > 15 && <div className="px-4 py-2 text-[11px] text-cm-faint">…e altre {ready.length - 15}</div>}
              </>
            ) : (
              <Empty>Nessuna commessa con tutte le righe finite.</Empty>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
