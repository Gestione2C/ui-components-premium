import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { S } from "../engine/state";
import { addArea, addOwner, removeArea, removeOwner, setAreaColor, setAreaOwner } from "../engine/actions";
import { Btn, FIELD, AreaChip, OwnerAvatar, areaColor } from "../ui/primitives";
import { Modal, MSec } from "../ui/Modal";
import { closeSettings, useOverlays } from "../ui/overlays";
import { useS } from "../ui/useS";
import { P } from "../theme";
import { PRIO_COLORS } from "../engine/constants";

const COLOR_IN = "h-8 w-9 shrink-0 cursor-pointer rounded border border-cm-line2 bg-cm-surface2 p-0.5";

function Body() {
  useS();
  const [oName, setOName] = useState("");
  const [oColor, setOColor] = useState("#00d4ff");
  const [aName, setAName] = useState("");
  const [aColor, setAColor] = useState("#a78bfa");
  const ao = S.cfg.areaOwner || {};
  return (
    <>
      <MSec title="Owners / Responsabili">
        <div className="mb-2.5">
          {S.cfg.owners.map((o, i) => (
            <div key={o.id + i} className="mb-1.5 flex items-center gap-2 rounded-lg border border-cm-line bg-cm-surface2 px-2.5 py-1.5">
              <OwnerAvatar id={o.id} size={26} text={10} />
              <span className="font-cmmono text-xs">{o.name}</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-full border border-cm-line2" style={{ background: o.color }} />
                <Btn size="sm" variant="d" aria-label={`Rimuovi owner ${o.name}`} onClick={() => removeOwner(i)}>
                  <X size={12} />
                </Btn>
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="text" aria-label="Nome owner" className={FIELD + " flex-1"} placeholder="Nome owner..." value={oName} onChange={(e) => setOName(e.target.value)} />
          <input type="color" aria-label="Colore owner" className={COLOR_IN} value={oColor} onChange={(e) => setOColor(e.target.value)} />
          <Btn
            variant="p"
            onClick={() => {
              if (!oName.trim()) return;
              addOwner(oName, oColor);
              setOName("");
            }}
          >
            <Plus size={12} /> Add
          </Btn>
        </div>
      </MSec>

      <MSec title="Aree di produzione">
        <div className="mb-2.5">
          {S.cfg.areas.map((a, i) => (
            <div key={a} className="mb-1.5 flex items-center gap-2">
              <AreaChip area={a} />
              <input
                type="color"
                title="Cambia colore"
                aria-label={`Colore area ${a}`}
                className="ml-auto h-6 w-[30px] cursor-pointer rounded border border-cm-line2 bg-cm-surface2 p-px"
                value={areaColor(a) || P.accent}
                onChange={(e) => setAreaColor(i, e.target.value)}
              />
              <Btn size="sm" variant="d" aria-label={`Rimuovi area ${a}`} onClick={() => removeArea(i)}>
                <X size={12} />
              </Btn>
            </div>
          ))}
        </div>
        <div className="mb-1.5 mt-3.5 border-b border-cm-line pb-1.5 font-cmmono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-cm-faint">
          Owner per area (assegnato in automatico)
        </div>
        <div className="mb-2.5">
          {S.cfg.areas.map((a, i) => (
            <div key={a} className="mb-1.5 flex items-center gap-2">
              <span className="flex-1 font-cmmono text-xs">{a}</span>
              <select aria-label={`Owner per ${a}`} className={FIELD + " flex-1"} value={ao[a] || ""} onChange={(e) => setAreaOwner(i, e.target.value)}>
                <option value="">— nessuno —</option>
                {S.cfg.owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            aria-label="Nome area"
            className={FIELD + " flex-1 uppercase"}
            placeholder="Nome area (es. VERNICIATURA)..."
            value={aName}
            onChange={(e) => setAName(e.target.value)}
          />
          <input type="color" title="Colore dell'area" aria-label="Colore nuova area" className={COLOR_IN} value={aColor} onChange={(e) => setAColor(e.target.value)} />
          <Btn
            variant="p"
            onClick={() => {
              const nm = aName.trim().toUpperCase();
              if (!nm || S.cfg.areas.includes(nm)) return;
              addArea(aName, aColor);
              setAName("");
            }}
          >
            <Plus size={12} /> Add
          </Btn>
        </div>
      </MSec>

      <MSec title="Priorità — legenda">
        <div className="font-cmmono text-[11px] leading-[2.2] text-cm-muted">
          {[
            [1, "1 — Critica", "blocca altri lavori, azione immediata"],
            [2, "2 — Alta", "da chiudere entro la settimana"],
            [3, "3 — Media", "normale avanzamento"],
            [4, "4 — Bassa", "non urgente"],
            [5, "5 — Sospesa", "in attesa di decisione esterna"],
          ].map(([p, l, d]) => (
            <div key={p as number} className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: (PRIO_COLORS)[p as number] }} />
              <span>
                <strong className="text-cm-ink">{l}</strong> · {d}
              </span>
            </div>
          ))}
        </div>
      </MSec>

      <div className="flex justify-end border-t border-cm-line pt-3.5">
        <Btn variant="s" onClick={closeSettings}>
          Chiudi
        </Btn>
      </div>
    </>
  );
}

export default function SettingsModal() {
  const { settings } = useOverlays();
  return (
    <Modal open={settings} onClose={closeSettings} title="Configurazione sistema" width={480}>
      {settings && <Body />}
    </Modal>
  );
}
