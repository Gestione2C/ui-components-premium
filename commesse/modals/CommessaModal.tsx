import React, { useState } from "react";
import { Clock, CheckCircle2, Trash2, Save, Plus, Check, Undo2, X, Package, User, Factory, Settings, FileText, HelpCircle } from "lucide-react";
import { G, S, areaOf, isDone, rowOf } from "../engine/state";
import { addBlock, clearGestione, deleteBlockModal, saveCommessa, toggleBlockModal } from "../engine/actions";
import { BLK_TIPI } from "../engine/constants";
import { fmtD } from "../engine/util";
import { Btn, FIELD } from "../ui/primitives";
import { Fg, Modal, MSec } from "../ui/Modal";
import { closeModal, useOverlays } from "../ui/overlays";
import { useS } from "../ui/useS";
import { P } from "../theme";
import type { Row } from "../engine/types";

const BICON: Record<string, React.ReactNode> = {
  MATERIALE: <Package size={14} />,
  CLIENTE: <User size={14} />,
  FORNITORE: <Factory size={14} />,
  TECNICO: <Settings size={14} />,
  DOCUMENTO: <FileText size={14} />,
  ALTRO: <HelpCircle size={14} />,
};
const BTIPO_LABEL: Record<string, string> = {
  MATERIALE: "Materiale mancante",
  CLIENTE: "Attesa cliente",
  FORNITORE: "Attesa fornitore",
  TECNICO: "Problema tecnico",
  DOCUMENTO: "Documento mancante",
  ALTRO: "Altro",
};

const RO = "cm-field opacity-60";

function Righe({ row }: { row: Row | undefined }) {
  const d = row && row.det;
  if (!row || !d) return null;
  const st = d.stats;
  const f = (x: Date | null | undefined) => (x ? fmtD(x) : "—");
  const pend = (l: { compl: number | null }) => l.compl != null && l.compl < 0.999;
  const lines = d.rows
    .filter((l) => !l.dup)
    .sort((a, b) => (pend(a) ? 0 : 1) - (pend(b) ? 0 : 1) || (+(a.scad as any) || 1e15) - (+(b.scad as any) || 1e15));
  return (
    <MSec title="Righe d'ordine (file Movimenti)">
      <div className="mb-1.5 text-[11px] text-cm-muted">
        {st.tracked ? `${st.done}/${st.tracked} righe complete` : "nessuna riga con avanzamento"}
        {st.untracked ? ` · ${st.untracked} senza scadenza/avanzamento (es. c/lav)` : ""}
        {st.tracked ? "" : ` su ${st.tot}`} · scadenza file generico <b>{f(row.concl_orig)}</b> → da righe <b>{f(st.ultima)}</b> (prossima {f(st.prossima)})
        {S.useDet ? "" : (
          <>
            {" · "}
            <i>non in uso (casella "Scad. righe")</i>
          </>
        )}
      </div>
      <div className="max-h-[220px] overflow-auto">
        <table className="cm-table compact w-full text-[11px]">
          <thead>
            <tr>
              <th>Cod.</th>
              <th>Prodotto</th>
              <th>Qtà</th>
              <th>Cat.</th>
              <th>Scadenza</th>
              <th>Compl.</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}>
                <td className="text-[10px]">{l.cod || ""}</td>
                <td className="max-w-[170px] truncate">
                  {l.prod || ""}
                  {l.note ? <span className="text-cm-faint"> · {l.note}</span> : null}
                </td>
                <td>{l.qta ?? ""}</td>
                <td>{l.cat || "—"}</td>
                <td>{f(l.scad)}</td>
                <td style={{ color: l.compl == null ? undefined : l.compl >= 0.999 ? P.ok : P.orange }} className={l.compl == null ? "text-cm-faint" : ""}>
                  {l.compl == null ? "—" : Math.round(l.compl * 100) + "%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MSec>
  );
}

function Form({ n }: { n: string }) {
  useS();
  const row = rowOf(n);
  const g = G(n);
  const [owner, setOwner] = useState(g.owner || "");
  const [prio, setPrio] = useState<number>(row && isDone(row) ? 6 : g.prio || 3);
  const [area, setArea] = useState(g.area || "");
  const [scadint, setScadint] = useState(g.scadint || "");
  const [note, setNote] = useState(g.note || "");
  const [showBlk, setShowBlk] = useState(false);
  const [nbTipo, setNbTipo] = useState("MATERIALE");
  const [nbScad, setNbScad] = useState("");
  const [nbDesc, setNbDesc] = useState("");
  const [nbErr, setNbErr] = useState(false);

  const ao = S.cfg.owners.find((o) => o.id === (S.cfg.areaOwner || {})[areaOf(row || { n })]);
  const blocks = g.blocks || [];
  const detRow = row && row.det ? row : S.rows.find((r) => r.n === n && r.det) || row;
  const dt = (s: string) => new Date(s).toLocaleDateString("it-IT");

  const saveBlk = () => {
    const desc = nbDesc.trim();
    if (!desc) {
      setNbErr(true);
      return;
    }
    setNbErr(false);
    addBlock(n, { tipo: nbTipo, desc, scad: nbScad });
    setNbDesc("");
    setNbScad("");
    setShowBlk(false);
  };
  const save = () => {
    saveCommessa(n, { owner, prio: prio || 3, area, scadint, note });
    closeModal();
  };
  const clear = () => {
    if (!confirm("Rimuovere tutti i dati gestionali per questa commessa?")) return;
    clearGestione(n);
    closeModal();
  };

  return (
    <>
      <MSec title="Dati da file (sola lettura)">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Fg label="N. Commessa">
            <input className={RO} value={n} readOnly />
          </Fg>
          <Fg label="Cliente">
            <input className={RO} value={row?.cliente || "—"} readOnly />
          </Fg>
          <Fg label="Data apertura">
            <input className={RO} value={fmtD(row?.data)} readOnly />
          </Fg>
          <Fg label="Concl. prevista (file)">
            <input className={RO} value={fmtD(row?.concl)} readOnly />
          </Fg>
          <Fg label="Ritardo corrente">
            <input className={RO} style={{ color: row?.in_ritardo ? P.bad : P.ok }} value={row?.ritardo != null ? row.ritardo + " gg" : "—"} readOnly />
          </Fg>
          <Fg label="Stato file">
            <input className={RO} value={row?.stato || "—"} readOnly />
          </Fg>
        </div>
      </MSec>

      <Righe row={detRow} />

      <MSec title="Gestione">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Fg label="Owner / Responsabile">
            <select className={FIELD} value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option value="">{"— Da area" + (ao ? ": " + ao.name : "") + " —"}</option>
              {S.cfg.owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Fg>
          <Fg label="Priorità">
            <select className={FIELD} value={prio} onChange={(e) => setPrio(parseInt(e.target.value))}>
              <option value={1}>1 — Critica</option>
              <option value={2}>2 — Alta</option>
              <option value={3}>3 — Media</option>
              <option value={4}>4 — Bassa</option>
              <option value={5}>5 — Sospesa</option>
              <option value={6}>6 - Completata</option>
            </select>
          </Fg>
          <Fg label="Area di produzione">
            <select className={FIELD} value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">{"— Automatica" + (row && row.area_auto ? ": " + row.area_auto : "") + " —"}</option>
              {S.cfg.areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Fg>
          <Fg label="Scadenza interna (rescheduling)">
            <input type="date" className={FIELD} value={scadint} onChange={(e) => setScadint(e.target.value)} />
          </Fg>
          <Fg label="Note interne" full>
            <textarea className={FIELD + " min-h-[70px]"} placeholder="Annotazioni operative, aggiornamenti avanzamento..." value={note} onChange={(e) => setNote(e.target.value)} />
          </Fg>
        </div>
      </MSec>

      <MSec title="Condizioni bloccanti">
        <div className="mb-2 flex flex-col gap-1.5">
          {!blocks.length ? (
            <div className="py-1.5 font-cmmono text-[11px] text-cm-faint">Nessuna condizione bloccante registrata</div>
          ) : (
            blocks.map((b) => (
              <div key={b.id} className={"flex items-start gap-2 rounded-lg border border-cm-line bg-cm-surface2 p-2.5 " + (b.resolved ? "opacity-60" : "")}>
                <span className="mt-0.5 text-cm-muted">{BICON[b.tipo] || <HelpCircle size={14} />}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs">
                    <strong>{b.tipo}</strong> — {b.desc || "—"}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[10.5px] text-cm-faint">
                    {b.scad ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> Scad: {b.scad} &nbsp;·&nbsp;
                      </span>
                    ) : null}
                    {b.resolved ? (
                      <span className="inline-flex items-center gap-1 text-cm-ok">
                        <CheckCircle2 size={11} /> Risolto {b.resolvedAt ? dt(b.resolvedAt) : ""}
                      </span>
                    ) : null}
                    {b.createdAt ? <span> · Creato: {dt(b.createdAt)}</span> : null}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Btn size="sm" variant={b.resolved ? "s" : "p"} onClick={() => toggleBlockModal(n, b.id)}>
                    {b.resolved ? <Undo2 size={12} /> : <Check size={12} />}
                    {b.resolved ? "Riapri" : "Risolto"}
                  </Btn>
                  <Btn size="sm" variant="d" aria-label="Elimina bloccante" onClick={() => deleteBlockModal(n, b.id)}>
                    <X size={12} />
                  </Btn>
                </div>
              </div>
            ))
          )}
        </div>
        <Btn variant="s" size="sm" onClick={() => setShowBlk(true)}>
          <Plus size={12} /> Aggiungi condizione bloccante
        </Btn>
        {showBlk && (
          <div className="mt-2.5 rounded-lg border border-cm-line2 bg-cm-surface2 p-3">
            <div className="mb-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Fg label="Tipo blocco">
                <select className={FIELD} value={nbTipo} onChange={(e) => setNbTipo(e.target.value)}>
                  {BLK_TIPI.map((t) => (
                    <option key={t} value={t}>
                      {BTIPO_LABEL[t]}
                    </option>
                  ))}
                </select>
              </Fg>
              <Fg label="Scadenza attesa risoluzione">
                <input type="date" className={FIELD} value={nbScad} onChange={(e) => setNbScad(e.target.value)} />
              </Fg>
              <Fg label="Descrizione" full>
                <input
                  type="text"
                  autoFocus
                  className={FIELD}
                  style={nbErr ? { borderColor: P.bad } : undefined}
                  placeholder="Descrivi il blocco..."
                  value={nbDesc}
                  onChange={(e) => setNbDesc(e.target.value)}
                />
              </Fg>
            </div>
            <div className="flex gap-2">
              <Btn variant="p" onClick={saveBlk}>
                Salva blocco
              </Btn>
              <Btn variant="s" onClick={() => setShowBlk(false)}>
                Annulla
              </Btn>
            </div>
          </div>
        )}
      </MSec>

      <div className="flex flex-wrap justify-end gap-2 border-t border-cm-line pt-3.5">
        <Btn variant="d" className="mr-auto" onClick={clear}>
          <Trash2 size={13} /> Rimuovi dati
        </Btn>
        <Btn variant="s" onClick={closeModal}>
          Annulla
        </Btn>
        <Btn variant="p" onClick={save}>
          <Save size={13} /> Salva
        </Btn>
      </div>
    </>
  );
}

export default function CommessaModal() {
  const { commessa } = useOverlays();
  return (
    <Modal open={!!commessa} onClose={closeModal} title={commessa ? `Commessa: ${commessa}` : "Commessa"} width={720}>
      {commessa && <Form key={commessa} n={commessa} />}
    </Modal>
  );
}
