import * as XLSX from "xlsx";
import type { Azione, Blocco, FileEntry, Gestione, Row } from "./types";
import {
  G,
  S,
  areaOf,
  cwRows,
  emit,
  getWKs,
  isDone,
  migrateAreas,
  openBlocks,
  ownerName,
  rowOf,
  saveLocal,
  clearWarn,
} from "./state";
import { guessWK, parseAll, reEnrich } from "./parse";
import { azioni } from "./calc";
import { fmtD } from "./util";

// ── file ──
export function handleFiles(files: FileList | File[]) {
  for (const f of Array.from(files)) {
    if (S.files.find((x) => x.name === f.name)) continue;
    S.files.push({ name: f.name, file: f, wk: guessWK(f.name), ok: null });
  }
  emit();
}
export function removeFile(i: number) {
  S.files.splice(i, 1);
  emit();
}

/** Analizza i file caricati. `setBusy` e `onDone` servono solo alla UI. */
export async function runParse(): Promise<{ ok: number; fail: number; merged: number; errors: string[] }> {
  const res = await parseAll();
  const e = S.det;
  if (res.ok > 0) {
    S.statusKind = "ok";
    S.status =
      `✓ ${res.ok} file · ${S.rows.length} commesse caricate` +
      (e
        ? ` · righe d'ordine: ${e.nRows} righe di ${e.nOrd} ordini, ${e.matched} agganciati${
            e.unmatched && e.unmatched.length ? ` (${e.unmatched.length} senza commessa)` : ""
          }`
        : "") +
      (res.merged ? ` · ${res.merged} nome/i cliente unificato/i` : "") +
      (res.fail ? ` · ${res.fail} errori` : "");
  } else if (res.errors.length) {
    S.statusKind = "err";
    S.status = res.errors.map((x) => `✗ ${x}`).join(" · ");
  }
  emit();
  return res;
}

// ── data di riferimento / scadenze righe ──
export function setRefDate(d: Date) {
  S.refDate = d;
  if (S.rows.length) reEnrich();
  emit();
}
export function setUseDet(v: boolean) {
  S.useDet = v;
  reEnrich();
  emit();
}
export function setWK(wk: string) {
  S.wk = wk;
  emit();
}

// ── commesse ──
export function riattivaCommessa(n: string) {
  const g = G(n);
  g.prio = 3;
  g.riaperta = true;
  saveLocal();
  emit();
}

export interface CommessaForm {
  owner: string;
  prio: number;
  area: string;
  scadint: string;
  note: string;
}
export function saveCommessa(n: string, f: CommessaForm) {
  const g = G(n);
  g.owner = f.owner;
  g.prio = f.prio || 3;
  const _r = rowOf(n);
  g.riaperta = g.prio !== 6 && !!(_r && _r.concluso);
  g.area = f.area;
  g.scadint = f.scadint;
  g.note = f.note;
  S.gestione[n] = g;
  saveLocal();
  emit();
}
export function clearGestione(n: string) {
  delete S.gestione[n];
  saveLocal();
  emit();
}

// ── bloccanti ──
export function addBlock(n: string, b: { tipo: string; desc: string; scad: string }) {
  const g = G(n);
  if (!g.blocks) g.blocks = [];
  g.blocks.push({ id: "b" + Date.now(), tipo: b.tipo, desc: b.desc, scad: b.scad, resolved: false, createdAt: new Date().toISOString() });
  emit();
}
export function toggleBlockModal(n: string, id: string) {
  const g = G(n);
  const b = (g.blocks || []).find((b) => b.id === id);
  if (b) {
    b.resolved = !b.resolved;
    b.resolvedAt = b.resolved ? new Date().toISOString() : null;
  }
  emit();
}
export function deleteBlockModal(n: string, id: string) {
  const g = G(n);
  g.blocks = (g.blocks || []).filter((b) => b.id !== id);
  emit();
}
export function quickToggleBlk(n: string, id: string) {
  const g = G(n);
  const b = (g.blocks || []).find((b) => b.id === id);
  if (b) {
    b.resolved = !b.resolved;
    b.resolvedAt = b.resolved ? new Date().toISOString() : null;
  }
  G(n);
  saveLocal();
  emit();
}

// ── suggerimenti ──
export interface SugLike {
  r: Row;
  tipo: string;
  desc: string;
  scad: string;
}
function pushSug(x: SugLike, i: number) {
  const g = G(x.r.n);
  (g.blocks = g.blocks || []).push({
    id: "b" + Date.now() + "_" + i,
    tipo: x.tipo,
    desc: x.desc,
    scad: x.scad,
    resolved: false,
    createdAt: new Date().toISOString(),
    auto: true,
  });
}
export function addSug(x: SugLike, i: number) {
  pushSug(x, i);
  saveLocal();
  emit();
}
export function addAllSug(list: SugLike[]) {
  if (!confirm(`Aggiungere tutti i ${list.length} bloccanti suggeriti?`)) return;
  list.forEach(pushSug);
  saveLocal();
  emit();
}
export function ignoreSug(x: SugLike) {
  const g = G(x.r.n);
  (g.sugIgn = g.sugIgn || []).push(x.tipo);
  saveLocal();
  emit();
}

// ── azioni di riunione ──
export function addAzione(a: { t: string; who: string; due: string; n: string }) {
  const t = a.t.trim();
  if (!t) return false;
  azioni().push({ id: "a" + Date.now(), t, who: a.who, due: a.due, n: a.n.trim(), done: false, created: new Date().toISOString(), wk: S.wk || "" });
  saveLocal();
  emit();
  return true;
}
export function toggleAzione(id: string) {
  const a = azioni().find((x) => x.id === id);
  if (!a) return;
  a.done = !a.done;
  a.doneAt = a.done ? new Date().toISOString() : null;
  saveLocal();
  emit();
}
export function delAzione(id: string) {
  S.cfg.azioni = azioni().filter((x) => x.id !== id);
  saveLocal();
  emit();
}

// ── soglie KPI ──
export function setKpiT(t: { av: number; pun: number; rit: number }) {
  S.cfg.kpiT = { av: +t.av || 0, pun: +t.pun || 0, rit: +t.rit || 0 };
  saveLocal();
  emit();
}

// ── configurazione ──
export function addOwner(name: string, color: string) {
  name = name.trim();
  if (!name) return;
  const id =
    name
      .split(" ")
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 3) || name.slice(0, 2).toUpperCase();
  S.cfg.owners.push({ id, name, color });
  saveLocal();
  emit();
}
export function removeOwner(i: number) {
  S.cfg.owners.splice(i, 1);
  saveLocal();
  emit();
}
export function addArea(name: string, color: string) {
  name = name.trim().toUpperCase();
  if (!name || S.cfg.areas.includes(name)) return;
  S.cfg.areas.push(name);
  S.cfg.areaColors = S.cfg.areaColors || {};
  S.cfg.areaColors[name] = color;
  saveLocal();
  emit();
}
export function removeArea(i: number) {
  if (S.cfg.areaColors) delete S.cfg.areaColors[S.cfg.areas[i]];
  S.cfg.areas.splice(i, 1);
  saveLocal();
  emit();
}
export function setAreaColor(i: number, c: string) {
  S.cfg.areaColors = S.cfg.areaColors || {};
  S.cfg.areaColors[S.cfg.areas[i]] = c;
  saveLocal();
  emit();
}
export function setAreaOwner(i: number, v: string) {
  S.cfg.areaOwner = S.cfg.areaOwner || {};
  S.cfg.areaOwner[S.cfg.areas[i]] = v;
  saveLocal();
  emit();
}

// ── export / import ──
export function exportJSON() {
  const blob = new Blob([JSON.stringify({ gestione: S.gestione, cfg: S.cfg }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "commesse_data_" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  try {
    localStorage.setItem("cm_lastexport", String(Date.now()));
  } catch (e) {
    /* ignora */
  }
  clearWarn();
}
export function importJSON(file: File) {
  const r = new FileReader();
  r.onload = (ev) => {
    try {
      const d = JSON.parse(String(ev.target?.result));
      if (d.gestione) S.gestione = d.gestione;
      if (d.cfg) S.cfg = d.cfg;
      migrateAreas();
      saveLocal();
      emit();
      alert("✅ Import completato!");
    } catch {
      alert("❌ File non valido.");
    }
  };
  r.readAsText(file);
}
export function exportXlsx() {
  if (!S.rows.length) {
    alert("Carica prima i file delle commesse.");
    return;
  }
  const out = cwRows().map((r) => ({
    Commessa: r.n,
    Cliente: r.cliente,
    "Data ordine": fmtD(r.data),
    "Fine prevista": fmtD(r.concl),
    Stato: isDone(r) ? "Concluso" : r.stato,
    "Ritardo (gg)": r.in_ritardo ? r.ritardo : 0,
    Owner: ownerName(r),
    Area: areaOf(r) || "",
    Priorita: G(r.n).prio,
    "Bloccanti aperti": openBlocks(r.n).length,
    Commento: r.commento || "",
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(out), String(S.wk).slice(0, 30));
  XLSX.writeFile(wb, "commesse_" + S.wk + "_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

export { getWKs };
export type { Azione, Blocco, FileEntry, Gestione };
