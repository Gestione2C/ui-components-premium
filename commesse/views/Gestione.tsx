import React, { useState } from "react";
import { ClipboardList, Pencil, Undo2, Construction } from "lucide-react";
import { G, S, areaOf, cwRowsCompletate, cwRowsOpen, ownerIdOf } from "../engine/state";
import { riattivaCommessa } from "../engine/actions";
import { PRIO_COLORS } from "../engine/constants";
import { Badge, Btn, Card, FIELD, OwnerAvatar, PageHeader, PrioTag, RowArea, RowOwner, Table, TblBox, Tabs, Th, WkBar, ritColor } from "../ui/primitives";
import { openModal } from "../ui/overlays";
import { useS } from "../ui/useS";
import { P } from "../theme";
import type { Row } from "../engine/types";

type Tab = "lista" | "priorita" | "owner" | "completate";

const SM: Record<string, "ok" | "info" | "danger" | "warn"> = { ok: "ok", parz: "info", ritardo: "danger", nodata: "warn" };
const SL: Record<string, string> = { ok: "Nei tempi", parz: "Parz.", ritardo: "In ritardo", nodata: "Senza data" };
const PRIO_GRP: Record<number, string> = { 1: "Critica", 2: "Alta", 3: "Media", 4: "Bassa", 5: "Sospesa" };

const ellip = "max-w-[140px] truncate";

function EditBtn({ n }: { n: string }) {
  return (
    <Btn size="sm" aria-label={`Modifica commessa ${n}`} title="Modifica" onClick={() => openModal(n)}>
      <Pencil size={12} />
    </Btn>
  );
}

export default function Gestione() {
  useS();
  const [tab, setTab] = useState<Tab>("lista");
  const [sf, setSf] = useState("all");
  const [pf, setPf] = useState("all");
  const [af, setAf] = useState("all");
  const [of, setOf] = useState("all");
  const [q, setQ] = useState("");
  const [cq, setCq] = useState("");
  const [sortCol, setSortCol] = useState("ritardo");
  const [sortAsc, setSortAsc] = useState(false);

  const sort2 = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  };
  const th = (col: string, label: string) => (
    <Th sort active={sortCol === col} asc={sortAsc} onSort={() => sort2(col)}>
      {label}
    </Th>
  );

  const open = cwRowsOpen();

  // ── lista ──
  const ql = q.toLowerCase();
  let filtered = open;
  if (sf === "ritardo") filtered = filtered.filter((r) => r.in_ritardo);
  else if (sf !== "all") filtered = filtered.filter((r) => r.stato_key === sf);
  if (pf !== "all") filtered = filtered.filter((r) => String(G(r.n).prio) === pf);
  if (af === "__none") filtered = filtered.filter((r) => !areaOf(r));
  else if (af !== "all") filtered = filtered.filter((r) => areaOf(r) === af);
  if (of !== "all") filtered = filtered.filter((r) => ownerIdOf(r) === of);
  if (ql) filtered = filtered.filter((r) => r.n.toLowerCase().includes(ql) || r.cliente.toLowerCase().includes(ql));
  filtered = [...filtered].sort((a, b) => {
    let av: any, bv: any;
    if (sortCol === "prio") {
      av = G(a.n).prio || 5;
      bv = G(b.n).prio || 5;
    } else {
      av = (a as any)[sortCol] ?? "";
      bv = (b as any)[sortCol] ?? "";
    }
    if (av === bv) return 0;
    return sortAsc ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
  });

  const renderLista = () => (
    <div>
      <div className="no-print mb-3 flex flex-wrap items-center gap-2 text-xs text-cm-muted">
        <WkBar />
        <label htmlFor="gf-stato">Stato</label>
        <select id="gf-stato" className={FIELD} value={sf} onChange={(e) => setSf(e.target.value)}>
          <option value="all">Tutti</option>
          <option value="ritardo">In ritardo</option>
          <option value="ok">Nei tempi</option>
          <option value="parz">Parz. concluso</option>
          <option value="nodata">Senza data</option>
        </select>
        <label htmlFor="gf-prio">Priorità</label>
        <select id="gf-prio" className={FIELD} value={pf} onChange={(e) => setPf(e.target.value)}>
          <option value="all">Tutte</option>
          <option value="1">Critica</option>
          <option value="2">Alta</option>
          <option value="3">Media</option>
          <option value="4">Bassa</option>
          <option value="5">Sospesa</option>
        </select>
        <label htmlFor="gf-area">Area</label>
        <select id="gf-area" className={FIELD} value={af} onChange={(e) => setAf(e.target.value)}>
          <option value="all">Tutte</option>
          <option value="__none">Non assegnata</option>
          {S.cfg.areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <label htmlFor="gf-own">Owner</label>
        <select id="gf-own" className={FIELD} value={of} onChange={(e) => setOf(e.target.value)}>
          <option value="all">Tutti</option>
          {S.cfg.owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <input type="text" aria-label="Cerca" className={FIELD + " w-[130px]"} placeholder="Cerca..." value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="font-cmmono text-cm-faint">{filtered.length} righe</span>
      </div>
      <Card glow={false} bodyClass="!px-0 !pb-0 !pt-0">
        <TblBox>
          <Table>
            <thead>
              <tr>
                {th("n", "N. Commessa")}
                {th("cliente", "Cliente")}
                {th("ritardo", "Ritardo")}
                {th("pct", "Righe")}
                <Th>Stato</Th>
                {th("prio", "Prio")}
                <Th>Area</Th>
                <Th>Owner</Th>
                <Th>
                  <Construction size={13} aria-label="Bloccanti" />
                </Th>
                <Th>Note</Th>
                <Th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const g = G(r.n);
                const blkN = (g.blocks || []).filter((b) => !b.resolved).length;
                const noteText = (g.note || r.commento || r.note || "").slice(0, 32);
                const d = r.det;
                return (
                  <tr key={r.n + r.wk}>
                    <td className="max-w-[130px] truncate text-[10px]">{r.n}</td>
                    <td className={ellip}>{r.cliente}</td>
                    <td className="font-semibold" style={{ color: !r.concl ? P.orange : ritColor(r) }}>
                      {!r.concl ? (
                        <>
                          Senza data
                          <div className="text-[9px] font-normal text-cm-faint">aperta da {r.gg_apertura ?? "?"} gg</div>
                        </>
                      ) : r.ritardo != null ? (
                        r.ritardo + " gg"
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="min-w-[90px] text-[10px]">
                      {d && d.stats.tracked ? (
                        <div
                          className="flex items-center gap-1.5"
                          title={`${d.stats.done} righe complete su ${d.stats.tracked} con avanzamento${d.stats.untracked ? ` (+${d.stats.untracked} senza avanzamento, es. c/lav)` : ""}`}
                        >
                          <div className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-cm-surface2">
                            <div className="h-full" style={{ width: (r.pct ?? 0) + "%", background: (r.pct ?? 0) >= 100 ? P.ok : P.accent }} />
                          </div>
                          <span>
                            {d.stats.done}/{d.stats.tracked}
                          </span>
                        </div>
                      ) : d ? (
                        <span className="text-cm-faint" title="Nessuna riga con avanzamento (es. conto lavoro)">
                          {d.stats.tot} r. · n.d.
                        </span>
                      ) : (
                        <span className="text-cm-faint">—</span>
                      )}
                    </td>
                    <td>
                      <Badge kind={SM[r.stato_key]}>{SL[r.stato_key]}</Badge>
                    </td>
                    <td>
                      <PrioTag prio={g.prio} />
                    </td>
                    <td>
                      <RowArea r={r} />
                    </td>
                    <td>
                      <RowOwner r={r} />
                    </td>
                    <td>
                      {blkN > 0 ? (
                        <Badge kind="block">
                          <Construction size={11} />
                          {blkN}
                        </Badge>
                      ) : (
                        <span className="text-cm-faint">—</span>
                      )}
                    </td>
                    <td className="max-w-[120px] truncate text-[10px] text-cm-muted">{noteText || "—"}</td>
                    <td>
                      <EditBtn n={r.n} />
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

  // ── completate ──
  const cql = cq.toLowerCase();
  let comp: Row[] = cwRowsCompletate();
  if (cql) comp = comp.filter((r) => r.n.toLowerCase().includes(cql) || r.cliente.toLowerCase().includes(cql));
  comp = [...comp].sort((a, b) => a.n.localeCompare(b.n));

  const renderCompletate = () => (
    <div>
      <div className="no-print mb-3 flex flex-wrap items-center gap-2 text-xs text-cm-muted">
        <WkBar />
        <label htmlFor="gc-q">Cerca</label>
        <input id="gc-q" type="text" className={FIELD + " w-[160px]"} placeholder="Cerca..." value={cq} onChange={(e) => setCq(e.target.value)} />
        <span className="font-cmmono text-cm-faint">{comp.length} righe</span>
      </div>
      <Card glow={false} bodyClass="!px-0 !pb-0 !pt-0">
        <TblBox>
          <Table>
            <thead>
              <tr>
                <Th>N. Commessa</Th>
                <Th>Cliente</Th>
                <Th>Area</Th>
                <Th>Owner</Th>
                <Th>Note</Th>
                <Th className="w-[70px]" />
              </tr>
            </thead>
            <tbody>
              {comp.length ? (
                comp.map((r) => {
                  const g = G(r.n);
                  const noteText = (g.note || r.commento || r.note || "").slice(0, 40);
                  return (
                    <tr key={r.n + r.wk}>
                      <td className="max-w-[130px] truncate text-[10px]">{r.n}</td>
                      <td className="max-w-[160px] truncate">{r.cliente}</td>
                      <td>
                        <RowArea r={r} />
                      </td>
                      <td>
                        <RowOwner r={r} />
                      </td>
                      <td className="max-w-[160px] truncate text-[10px] text-cm-muted">{noteText || "—"}</td>
                      <td>
                        <div className="flex gap-1">
                          <EditBtn n={r.n} />
                          <Btn size="sm" aria-label={`Riporta tra le aperte ${r.n}`} title="Riporta tra le aperte" onClick={() => riattivaCommessa(r.n)}>
                            <Undo2 size={12} />
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="!py-5 text-center text-cm-faint">
                    Nessuna commessa completata{cq ? " per la ricerca corrente" : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TblBox>
      </Card>
    </div>
  );

  // ── per priorità ──
  const renderPrio = () => (
    <div>
      <WkBar className="mb-3" />
      {[1, 2, 3, 4, 5].map((p) => {
        const pr = open.filter((r) => G(r.n).prio === p);
        if (!pr.length) return null;
        return (
          <Card
            key={p}
            glow={false}
            bodyClass="!px-0 !pb-0 !pt-0"
            title={
              <>
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: PRIO_COLORS[p] }} />
                {PRIO_GRP[p]} — {pr.length} commesse
              </>
            }
          >
            <TblBox>
              <Table>
                <thead>
                  <tr>
                    <Th>N.</Th>
                    <Th>Cliente</Th>
                    <Th>Ritardo</Th>
                    <Th>Area</Th>
                    <Th>Owner</Th>
                    <Th>Bloccanti</Th>
                  </tr>
                </thead>
                <tbody>
                  {pr.map((r) => {
                    const bl = (G(r.n).blocks || []).filter((b) => !b.resolved).length;
                    const ow = S.cfg.owners.find((o) => o.id === ownerIdOf(r));
                    return (
                      <tr key={r.n + r.wk}>
                        <td className="text-[10px]">{r.n}</td>
                        <td>{r.cliente.slice(0, 30)}</td>
                        <td className="font-semibold" style={{ color: r.ritardo > 0 ? P.bad : P.ok }}>
                          {r.ritardo != null ? r.ritardo + " gg" : "—"}
                        </td>
                        <td>
                          <RowArea r={r} small />
                        </td>
                        <td>{ow ? ow.name : "—"}</td>
                        <td>
                          {bl > 0 ? (
                            <Badge kind="block">
                              <Construction size={11} /> {bl}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TblBox>
          </Card>
        );
      })}
    </div>
  );

  // ── per owner ──
  const renderOwner = () => (
    <div>
      <WkBar className="mb-3" />
      {S.cfg.owners.map((o) => {
        const or = open.filter((r) => ownerIdOf(r) === o.id);
        if (!or.length) return null;
        return (
          <Card
            key={o.id}
            glow={false}
            title={
              <>
                <OwnerAvatar id={o.id} size={28} text={11} />
                <span className="normal-case tracking-normal text-cm-ink">
                  {o.name} — {or.length} commesse
                </span>
              </>
            }
          >
            <div className="flex flex-wrap gap-2 pt-1">
              {or.map((r) => {
                const bl = (G(r.n).blocks || []).filter((b) => !b.resolved).length;
                return (
                  <button
                    key={r.n + r.wk}
                    type="button"
                    onClick={() => openModal(r.n)}
                    className="flex w-[185px] cursor-pointer flex-col gap-1 rounded-lg border border-cm-line bg-cm-surface2 p-2.5 text-left transition-colors hover:border-cm-accent"
                  >
                    <span className="truncate font-cmmono text-[11px] font-semibold text-cm-accent">{r.n.slice(0, 24)}</span>
                    <span className="truncate text-[11px] text-cm-muted">{r.cliente.slice(0, 26)}</span>
                    <span className="flex items-center justify-between">
                      <span className="text-[9.5px]" style={{ color: r.ritardo > 0 ? P.bad : r.ritardo === 0 ? P.ok : P.orange }}>
                        {r.ritardo != null ? r.ritardo + "gg" : "no data"}
                      </span>
                      {bl > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cm-bad">
                          <Construction size={11} />
                          {bl}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div>
      <PageHeader icon={<ClipboardList size={22} />} title="Gestione Commesse" desc="Qui assegni owner, priorità e bloccanti alle singole commesse." />
      <Tabs
        id="gst"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "lista", label: "Lista" },
          { value: "priorita", label: "Per priorità" },
          { value: "owner", label: "Per owner" },
          { value: "completate", label: "Completate" },
        ]}
      />
      {tab === "lista" && renderLista()}
      {tab === "priorita" && renderPrio()}
      {tab === "owner" && renderOwner()}
      {tab === "completate" && renderCompletate()}
    </div>
  );
}
