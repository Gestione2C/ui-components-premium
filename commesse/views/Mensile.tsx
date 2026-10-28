import React, { useState } from "react";
import { CalendarDays, Pencil, X } from "lucide-react";
import { S, isDone } from "../engine/state";
import { computeMens, valOf } from "../engine/calc";
import { setKpiT } from "../engine/actions";
import { eur, fmtD, lblM } from "../engine/util";
import { Badge, Btn, Card, Details, Empty, FIELD, Highlight, Hint, Kpi, KpiGrid, Legend, Note, PageHeader, Pbar, Table, TblBox, WkBar } from "../ui/primitives";
import { ChartCanvas, gridY, noGrid, tick } from "../ui/Chart";
import { openModal } from "../ui/overlays";
import MensBento from "../ui/MensBento";
import { P } from "../theme";
import { useS } from "../ui/useS";

type K = "av" | "pun" | "rit";
const DASH = "—";

export default function Mensile() {
  useS();
  // stato locale: soglie in digitazione e mese selezionato (nel SOURCE restava selezionato tra i render)
  const [draft, setDraft] = useState<Partial<Record<K, string>>>({});
  const [sel, setSel] = useState<number | null>(null);

  const header = (
    <PageHeader
      icon={<CalendarDays size={22} />}
      title="Avanzamento mensile"
      desc="Mese per mese: quanto lavoro era previsto, quanto è stato completato e quante commesse sono in ritardo."
      right={<WkBar />}
    />
  );
  if (!S.rows.length) return <div id="page-mensile">{header}</div>;

  const m = computeMens();
  const { T, ref, M, PI, A, all, ND, P: PC, scad, nop, exN, TD, av, sc, pun, op, ritN, rit, dm, pm, has, cur } = m;
  const noDone = !!(S.det && S.det.noDone);
  const col = (ok: boolean, warn: boolean) => (ok ? P.ok : warn ? P.orange : P.bad);
  const colr = (v: number, t: number) => (v >= t ? P.ok : v >= t - 15 ? P.orange : P.bad);
  const bd = (v: number, ok: number) => <Badge kind={v >= ok ? "ok" : v >= ok - 15 ? "warn" : "danger"}>{v.toFixed(0)}%</Badge>;

  const onT = (k: K, v: string) => {
    setDraft((d) => ({ ...d, [k]: v }));
    const t = { ...T, [k]: v } as Record<K, any>;
    setKpiT({ av: +t.av || 0, pun: +t.pun || 0, rit: +t.rit || 0 });
  };
  const tv = (k: K) => draft[k] ?? String(T[k]);
  const thr = (k: K, label: string) => (
    <label className="flex items-center gap-1.5">
      {label}
      <input
        type="number"
        min={0}
        max={100}
        className={FIELD + " w-[60px]"}
        value={tv(k)}
        onChange={(e) => onT(k, e.target.value)}
        onBlur={() => setDraft((d) => ({ ...d, [k]: undefined }))}
      />
      %
    </label>
  );

  const L = all.map(lblM);

  // ── righe tabelle ──
  const detRow = (mm: { k: number; n: number; conc: number; parz: number; ok: number; rit: number; righe: number; tot: number; pr: number }, k: number) => {
    let pc: number | null = mm.tot ? (mm.pr / mm.tot) * 100 : null;
    const pu = mm.n && mm.k && mm.k < cur ? (mm.conc / mm.n) * 100 : null;
    if (!mm.k) pc = null;
    return (
      <tr
        key={k + "-" + (mm.k ? "m" : "nd")}
        className={k ? "cursor-pointer" : undefined}
        onClick={k ? () => setSel(k) : undefined}
      >
        <td><b>{lblM(k)}</b></td>
        <td>{mm.n || DASH}</td>
        <td>{mm.conc || DASH}</td>
        <td>{mm.parz || DASH}</td>
        <td>{mm.ok || DASH}</td>
        <td>{mm.rit ? <span className="text-cm-bad">{mm.rit}</span> : DASH}</td>
        <td>{pu == null ? DASH : bd(pu, T.pun)}</td>
        <td>{mm.righe || DASH}</td>
        <td className="num">{mm.tot ? eur(mm.tot) : DASH}</td>
        <td className="num">{mm.tot ? eur(mm.pr) : DASH}</td>
        <td className="num">{mm.tot ? eur(mm.tot - mm.pr) : DASH}</td>
        <td>{pc == null ? DASH : bd(pc, T.av)}</td>
      </tr>
    );
  };

  const c0 = M[cur];
  const showHead = !!(c0 && c0.tot && !noDone);
  const pc0 = showHead ? (c0.pr / c0.tot) * 100 : 0;

  const cl = Object.keys(PC).sort();
  const pk = all.filter((k) => cl.some((c) => PC[c][k]));
  const cell = (x?: { t: number; c: number; res: number }) => {
    if (!x) return <td>{DASH}</td>;
    const v = (x.c / x.t) * 100;
    return (
      <td title={`${x.t} righe · residuo ${eur(x.res)}`}>
        <Badge kind={v >= T.av ? "ok" : v >= T.av - 15 ? "warn" : "danger"}>{v.toFixed(0)}%</Badge> <span className="text-[10px] text-cm-faint">{x.t}</span>
      </td>
    );
  };
  const hasND = cl.some((c) => PC[c][0]);

  // ── dettaglio mese (selezione che persiste finché il mese esiste) ──
  const dm0 = sel != null ? M[sel] : undefined;
  const detRows = dm0 ? dm0.rs.slice().sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || b.ritardo - a.ritardo) : [];

  const valNote = has
    ? `${PI ? "Importi per mese di scadenza dell'ordine («Arretrato» = scadenza già passata, lavoro ancora da consegnare)." : "Importi per mese in cui la riga deve essere pronta."} Senza scadenza: ${ND.righe} righe, ${eur(ND.tot)} (non nel grafico, sono nella tabella).${nop ? ` ${nop} righe senza prezzo escluse dagli importi.` : ""}` +
      (exN ? ` Escluse ${exN} righe di ordini non presenti nel file commesse (es. anni precedenti) o di commesse concluse.` : "") +
      (S.det && S.det.fmt === "mesi" && !S.det.nRed
        ? S.det.piano
          ? ' Nel Piano "completato" è la quota che i responsabili di reparto confermano di consegnare (100% = pronta), contata fino al mese in corso.'
          : ' Nessuna riga risulta completata: se nel file ci sono righe rosse, aggiungi una colonna "Completata" con SI.'
        : "")
    : "Carica insieme anche il file Movimenti per vedere i valori.";

  const stackOpts = (extra: any, yTick: any) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { stacked: true, ticks: yTick, grid: gridY, ...extra }, x: { stacked: true, ticks: tick, grid: noGrid } },
  });

  return (
    <div id="page-mensile">
      {header}
      {has && !noDone && <MensBento m={m} />}
      <div className="no-print mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-cm-muted">
        <b>Soglie per i colori</b> (verde = obiettivo raggiunto):
        {thr("av", "Lavoro completato almeno")}
        {thr("pun", "Commesse chiuse in tempo almeno")}
        {thr("rit", "Commesse in ritardo al massimo")}
      </div>

      <Details summary="Cosa significano queste voci?">
        <b>Previsto</b>: valore (in €) delle righe d'ordine con scadenza in quel mese ("Concl. prevista ordine"). <b>Arretrato</b> = righe con scadenza già passata e ancora da consegnare.
        <br />
        <b>Completato</b>: la parte di quel valore già finita. Nel Piano è la quota che il responsabile di reparto conferma di consegnare (100% = riga pronta), contata fino al mese in corso.
        <br />
        <b>Commessa in ritardo</b>: commessa ancora aperta la cui data di conclusione prevista è già passata.
        <br />
        <b>Chiusa in tempo</b>: commessa conclusa tra quelle che avevano la scadenza già passata.
        <br />
        <b>Non pianificate</b>: righe d'ordine a cui non è stato ancora assegnato un mese.
        <br />
        <b>Colori</b>: verde = obiettivo raggiunto, arancio = poco sotto (entro 15 punti), rosso = sotto.
      </Details>

      <KpiGrid>
        {has && !noDone ? (
          <Kpi
            label="Lavoro completato"
            value={av.toFixed(0) + "%"}
            sub={`${eur(TD.pr)} finiti su ${eur(TD.tot)} ${PI ? "da fare fino a " + lblM(cur) + " (arretrato compreso)" : "previsti"} · obiettivo almeno ${T.av}%`}
            color={col(av >= T.av, av >= T.av - 15)}
          />
        ) : (
          <Kpi label="Lavoro completato" value="n.d." sub={has ? "il file non indica quali righe sono completate" : "Carica anche il file Movimenti"} color={P.mute} />
        )}
        {has && !noDone && !(S.det && S.det.piano) && (
          <Kpi
            label="Scaduto e non finito"
            value={eur(scad)}
            sub={scad ? "valore delle righe con data già passata e non ancora complete" : "nessuna riga scaduta e incompleta"}
            color={scad ? P.bad : P.ok}
          />
        )}
        <Kpi
          label="Commesse chiuse in tempo"
          value={pun == null ? DASH : pun.toFixed(0) + "%"}
          sub={`${sc.filter(isDone).length} chiuse su ${sc.length} che avevano la data già passata · obiettivo almeno ${T.pun}%`}
          color={pun == null ? P.mute : col(pun >= T.pun, pun >= T.pun - 15)}
        />
        <Kpi
          label="Commesse in ritardo"
          value={rit.toFixed(0) + "%"}
          sub={`${ritN} su ${op.length} commesse aperte hanno superato la data prevista · massimo ${T.rit}%`}
          color={col(rit <= T.rit, rit <= T.rit + 15)}
        />
        {has && pm != null && (
          <Kpi label="Righe d'ordine finite" value={pm.toFixed(0) + "%"} sub={`su ${dm.t} righe controllate · obiettivo almeno ${T.av}%`} color={col(pm >= T.av, pm >= T.av - 15)} />
        )}
      </KpiGrid>

      {showHead && (
        <Highlight big={pc0.toFixed(0) + "%"} color={colr(pc0, T.av)}>
          <b>{lblM(cur)} (mese in corso)</b>: completati {eur(c0.pr)} su {eur(c0.tot)} previsti.
          {ritN ? ` Ci sono ${ritN} commesse aperte oltre la data prevista` : ""}
          {scad ? `${ritN ? " e " : " Ci sono "}${eur(scad)} di righe scadute ancora da completare` : ""}
          {ritN || scad ? "." : ""}
        </Highlight>
      )}

      <Details summary="Mostra tabella dettagliata (righe, importi, puntualità)">
        <TblBox className="-mx-4">
          <Table>
            <thead>
              <tr>
                <th>Mese</th>
                <th>Commesse previste</th>
                <th>Concluse</th>
                <th>Parz.</th>
                <th>Aperte</th>
                <th>In ritardo</th>
                <th>Puntualità</th>
                <th>Righe</th>
                <th>Valore</th>
                <th>Pronto</th>
                <th>Residuo</th>
                <th>Avanz. valore</th>
              </tr>
            </thead>
            <tbody>
              {A.map((mm) => detRow(mm, mm.k))}
              {ND.righe ? detRow({ ...ND, k: 0, n: 0, conc: 0, parz: 0, ok: 0, rit: 0 }, 0) : null}
            </tbody>
          </Table>
        </TblBox>
      </Details>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
        <Card
          className="lg:col-span-4"
          title="Lavoro previsto in ogni mese (€): completato e ancora da fare"
          right={<Legend items={[{ color: P.ok, label: "Completato" }, { color: P.orange, label: "Ancora da fare" }, { color: P.accent, label: "% completata" }]} />}
        >
          <ChartCanvas
            height={260}
            label="Lavoro previsto in ogni mese"
            config={{
              data: {
                labels: L,
                datasets: [
                  { type: "bar", label: "Completato", data: A.map((x) => Math.round(x.pr)), backgroundColor: P.ok, stack: "v", borderRadius: 4, yAxisID: "y" },
                  { type: "bar", label: "Ancora da fare", data: A.map((x) => Math.round(x.tot - x.pr)), backgroundColor: P.orange, stack: "v", borderRadius: 4, yAxisID: "y" },
                  { type: "line", label: "% completata", data: A.map((x) => (x.tot ? Math.round((x.pr / x.tot) * 100) : null)), borderColor: P.accent, backgroundColor: P.accent, tension: 0.3, pointRadius: 4, yAxisID: "y1", spanGaps: false },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { stacked: true, ticks: { ...tick, callback: (v: any) => eur(v) }, grid: gridY },
                  y1: { position: "right", min: 0, max: 100, ticks: { color: P.accent, callback: (v: any) => v + "%" }, grid: noGrid },
                  x: { stacked: true, ticks: tick, grid: noGrid },
                },
              },
            }}
          />
          <Note>{valNote}</Note>
        </Card>

        <Card
          className="lg:col-span-2"
          title="Commesse per mese di conclusione prevista"
          right={
            <Legend
              items={[
                { color: P.ok, label: "Concluse" },
                { color: P.info, label: "Parz. concluse" },
                { color: P.accent, label: "Aperte nei tempi" },
                { color: P.bad, label: "In ritardo" },
              ]}
            />
          }
        >
          <ChartCanvas
            height={260}
            label="Commesse per mese di conclusione prevista"
            config={{
              type: "bar",
              data: {
                labels: L,
                datasets: (
                  [
                    ["Concluse", "conc", P.ok],
                    ["Parz.", "parz", P.info],
                    ["Aperte nei tempi", "ok", P.accent],
                    ["In ritardo", "rit", P.bad],
                  ] as const
                ).map(([label, f, c]) => ({ label, data: A.map((x) => x[f]), backgroundColor: c, stack: "c" })),
              },
              options: stackOpts({}, { ...tick, precision: 0 }),
            }}
          />
        </Card>

        <Card className="lg:col-span-6" title="Situazione mese per mese" bodyClass="px-0 pb-1 pt-1">
          <Hint>
            <span className="px-3 block">
              Ogni riga è un mese. Le barre mostrano quanto è stato completato rispetto al previsto: verde = in linea con l'obiettivo, arancio = poco sotto, rosso = sotto. Clicca su un mese per vedere le commesse.
            </span>
          </Hint>
          <TblBox>
            <Table>
              <thead>
                <tr>
                  <th>Mese</th>
                  <th className="min-w-[170px]">Commesse concluse</th>
                  <th className="min-w-[210px]">Valore completato</th>
                  <th>Situazione</th>
                </tr>
              </thead>
              <tbody>
                {A.filter((x) => x.n || x.tot).map((x) => {
                  const pu = x.n ? (x.conc / x.n) * 100 : 0,
                    pc = x.tot ? (x.pr / x.tot) * 100 : null;
                  let st: [string, "mut" | "ok" | "warn" | "danger"];
                  if (x.k > cur && !x.rit) st = ["Previsto", "mut"];
                  else if (!x.rit && (pc == null || pc >= T.av)) st = ["In linea", "ok"];
                  else if ((x.n && pu >= T.pun - 15) || (pc != null && pc >= T.av - 15)) st = ["Attenzione", "warn"];
                  else st = ["Critico", "danger"];
                  return (
                    <tr
                      key={x.k}
                      className="cursor-pointer"
                      tabIndex={0}
                      onClick={() => setSel(x.k)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(x.k)}
                    >
                      <td><b>{lblM(x.k)}</b></td>
                      <td>
                        {x.n ? (
                          <>
                            <Pbar value={pu} color={colr(pu, T.pun)} />
                            <small className="text-cm-faint">
                              {x.conc} su {x.n}
                              {x.rit ? (
                                <>
                                  {" · "}
                                  <span className="text-cm-bad">{x.rit} in ritardo</span>
                                </>
                              ) : null}
                            </small>
                          </>
                        ) : (
                          DASH
                        )}
                      </td>
                      <td>
                        {x.tot ? (
                          <>
                            <Pbar value={pc as number} color={colr(pc as number, T.av)} />
                            <small className="text-cm-faint">
                              {eur(x.pr)} su {eur(x.tot)} ({(pc as number).toFixed(0)}%)
                            </small>
                          </>
                        ) : (
                          DASH
                        )}
                      </td>
                      <td><Badge kind={st[1]}>{st[0]}</Badge></td>
                    </tr>
                  );
                })}
                {ND.righe ? (
                  <tr>
                    <td><b>Non pianificate</b></td>
                    <td>{DASH}</td>
                    <td>
                      <small className="text-cm-faint">
                        {eur(ND.tot)} su {ND.righe} righe senza un mese assegnato
                      </small>
                    </td>
                    <td><Badge kind="warn">Da pianificare</Badge></td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </TblBox>
        </Card>

        {dm0 && sel != null && (
          <Card
            className="lg:col-span-6"
            id="mens-det-card"
            title={`Commesse con conclusione prevista ${lblM(sel)} (${dm0.rs.length})`}
            right={
              <Btn size="sm" aria-label="Chiudi dettaglio mese" onClick={() => setSel(null)}>
                <X size={12} />
              </Btn>
            }
            bodyClass="px-0 pb-1 pt-1"
          >
            <TblBox>
              <Table>
                <thead>
                  <tr>
                    <th>Commessa</th>
                    <th>Cliente</th>
                    <th>Stato</th>
                    <th>Concl. prev.</th>
                    <th>Ritardo</th>
                    <th>Valore</th>
                    <th>Avanz.</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {detRows.map((r) => {
                    const v = r.det ? valOf(r) : null,
                      d = isDone(r),
                      late = !d && r.in_ritardo;
                    return (
                      <tr key={r.n}>
                        <td>{r.n}</td>
                        <td>{r.cliente}</td>
                        <td>{d ? <Badge kind="ok">Conclusa</Badge> : r.stato}</td>
                        <td>{fmtD(r.concl_orig)}</td>
                        <td>{late ? r.ritardo + " gg" : DASH}</td>
                        <td className="num">{v ? eur(v.tot) : DASH}</td>
                        <td>{v && v.tot ? Math.round((v.pr / v.tot) * 100) + "%" : DASH}</td>
                        <td>
                          <Btn size="sm" aria-label={"Apri commessa " + r.n} title="Apri commessa" onClick={() => openModal(r.n)}>
                            <Pencil size={12} />
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TblBox>
          </Card>
        )}

        <Card className="lg:col-span-6" title="Produzione: avanzamento righe per reparto e mese di scadenza" bodyClass="px-0 pb-1 pt-1">
          <Hint>
            <span className="px-3 block">Quanto è stato completato in ogni reparto, mese per mese. Il numero piccolo accanto alla % è quante righe d'ordine ci sono.</span>
          </Hint>
          {cl.length ? (
            <TblBox>
              <Table>
                <thead>
                  <tr>
                    <th>Reparto</th>
                    {pk.map((k) => (
                      <th key={k}>{lblM(k)}</th>
                    ))}
                    {hasND && <th>Senza scad.</th>}
                    <th>Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {cl.map((c) => {
                    const t = Object.values(PC[c]).reduce((a, x) => ({ t: a.t + x.t, c: a.c + x.c, res: a.res + x.res }), { t: 0, c: 0, res: 0 });
                    return (
                      <tr key={c}>
                        <td><b>{c}</b></td>
                        {pk.map((k) => React.cloneElement(cell(PC[c][k]), { key: k }))}
                        {hasND && cell(PC[c][0])}
                        {cell(t)}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TblBox>
          ) : (
            <Empty>Servono le righe d'ordine (file Movimenti).</Empty>
          )}
          <div className="px-4 pb-2 pt-1 text-[11px] text-cm-faint">
            % medio di completamento delle righe d'ordine (solo righe con % tracciata). Verde ≥ obiettivo, arancio entro 15 punti, rosso sotto. Il reparto deriva dalla categoria della riga.
          </div>
        </Card>
      </div>
    </div>
  );
}
