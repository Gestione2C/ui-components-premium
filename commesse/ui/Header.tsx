import React, { useRef, useState } from "react";
import { Download, Search, Settings, Upload as UploadIcon, FileSpreadsheet } from "lucide-react";
import { S, cwRows, isDone } from "../engine/state";
import { exportJSON, exportXlsx, importJSON, setRefDate, setUseDet } from "../engine/actions";
import { isoDay, parseIsoDay } from "../engine/util";
import { Btn } from "./primitives";
import { openModal, openSettings } from "./overlays";
import { useS } from "./useS";

function SearchBox() {
  const [q, setQ] = useState("");
  useS();
  const v = q.trim().toLowerCase();
  const res =
    v.length < 2 || !S.rows.length ? null : cwRows().filter((r) => (r.n + " " + r.cliente + " " + (r.commento || "")).toLowerCase().includes(v)).slice(0, 8);
  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-cm-faint" />
      <input
        type="search"
        aria-label="Cerca commessa o cliente"
        placeholder="Cerca commessa o cliente…"
        autoComplete="off"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setQ("")}
        className="cm-field w-64 !pl-8"
      />
      {res && (
        <div className="absolute right-0 top-10 z-[250] max-h-80 w-[380px] max-w-[90vw] overflow-auto rounded-xl border border-cm-line2 bg-cm-surface shadow-2xl">
          {res.length ? (
            res.map((r) => (
              <button
                key={r.n + r.wk}
                type="button"
                onClick={() => {
                  setQ("");
                  openModal(r.n);
                }}
                className="block w-full cursor-pointer border-b border-cm-line px-3 py-2 text-left text-xs transition-colors last:border-0 hover:bg-white/[0.04]"
              >
                <b>{r.n.slice(0, 26)}</b> · {r.cliente.slice(0, 24)}
                <div className="text-[10.5px] text-cm-faint">
                  {isDone(r) ? "Concluso" : r.stato}
                  {r.in_ritardo ? " · in ritardo " + r.ritardo + " gg" : ""}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2.5 text-xs text-cm-faint">Nessun risultato</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  useS();
  const imp = useRef<HTMLInputElement>(null);
  return (
    <header className="no-print relative z-[100] flex flex-wrap items-center justify-between gap-3 border-b border-cm-line bg-cm-surface px-5 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cm-accent font-cmmono text-xs font-bold text-[#04222a]">CM</div>
        <div>
          <div className="font-cmmono text-[13px] font-semibold tracking-wide">COMMESSE ANALYZER PRO</div>
          <div className="text-[11px] text-cm-faint">Analisi · Gestione · Produzione · Bloccanti</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox />
        <label className="flex items-center gap-1.5 font-cmmono text-[11px] text-cm-muted">
          Data rif.
          <input
            type="date"
            className="cm-field"
            value={isoDay(S.refDate)}
            onChange={(e) => e.target.value && setRefDate(parseIsoDay(e.target.value))}
          />
        </label>
        <label
          className="flex cursor-pointer items-center gap-1.5 font-cmmono text-[11px] text-cm-muted"
          title="Con il file delle righe d'ordine caricato, usa le scadenze aggiornate delle righe al posto della 'Concl. prevista' del file generico"
        >
          <input type="checkbox" checked={S.useDet} onChange={(e) => setUseDet(e.target.checked)} /> Scad. righe
        </label>
        <Btn onClick={openSettings}>
          <Settings size={14} /> Config
        </Btn>
        <Btn onClick={exportXlsx}>
          <FileSpreadsheet size={14} /> Excel
        </Btn>
        <Btn onClick={exportJSON}>
          <Download size={14} /> Export
        </Btn>
        <Btn onClick={() => imp.current?.click()}>
          <UploadIcon size={14} /> Import
        </Btn>
        <input
          ref={imp}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJSON(f);
            e.target.value = "";
          }}
        />
      </div>
    </header>
  );
}
