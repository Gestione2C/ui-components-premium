import type { Cfg, Det, FileEntry, Gestione, Row } from "./types";

/**
 * Stato condiviso dell'analizzatore. È lo stesso oggetto `S` del vecchio file HTML:
 * il motore di calcolo lo legge/modifica, la UI React si aggiorna tramite `emit()`.
 */
export interface Warn {
  msg: string; // può contenere <b>…</b>
  danger: boolean;
}

export const S = {
  files: [] as FileEntry[],
  rows: [] as Row[],
  wk: null as string | null,
  useDet: true,
  det: null as Det | null,
  refDate: (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })(),
  gestione: {} as Record<string, Gestione>,
  cfg: {
    owners: [],
    areaOwner: {},
    areas: ["VERNICIATURA/MARCATURA", "TARGHETTE", "ASSEMBLAGGIO", "LAVORAZIONI"],
  } as Cfg,
  warn: null as Warn | null,
  status: "" as string,
  statusKind: "ok" as "ok" | "err",
};

// ── store: sottoscrizione minimale per useSyncExternalStore ──
let version = 0;
const listeners = new Set<() => void>();
export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getVersion = () => version;
export function emit() {
  version++;
  listeners.forEach((l) => l());
}

export function showWarn(msg: string, danger = false) {
  S.warn = { msg, danger };
  emit();
}
export function clearWarn() {
  S.warn = null;
  emit();
}

// ── LocalStorage (stesse chiavi del vecchio analizzatore) ──
export function loadLocal() {
  try {
    const g = localStorage.getItem("cm_gestione");
    if (g) S.gestione = JSON.parse(g);
    const c = localStorage.getItem("cm_cfg");
    if (c) S.cfg = JSON.parse(c);
  } catch (e) {
    /* ignora */
  }
}

export function saveLocal() {
  try {
    localStorage.setItem("cm_gestione", JSON.stringify(S.gestione));
    localStorage.setItem("cm_cfg", JSON.stringify(S.cfg));
  } catch (e) {
    showWarn(
      "⚠ Impossibile salvare nel browser: le modifiche andranno perse alla chiusura. Usa <b>Export</b> per conservarle.",
      true,
    );
  }
}

export function checkBackup() {
  try {
    const has = Object.values(S.gestione).some((g) => g && (g.owner || g.note || (g.blocks && g.blocks.length)));
    const last = +(localStorage.getItem("cm_lastexport") || 0) || 0;
    if (has && Date.now() - last > 7 * 86400000)
      showWarn(
        "💾 " +
          (last ? "Ultimo export: " + new Date(last).toLocaleDateString("it-IT") + "." : "Nessun export effettuato.") +
          " Fai <b>Export</b> per avere una copia dei dati gestionali.",
      );
  } catch (e) {
    /* ignora */
  }
}

// ── aree: normalizzazione e migrazioni una tantum ──
export function normArea(a: any): string {
  const u = String(a || "")
    .toUpperCase()
    .replace(/\s+/g, "");
  if (u.includes("LASER")) return "TARGHETTE"; // marcatura laser = targhette
  return u === "VERNICIATURA" || u === "MARCATURA" || u === "VERNICIATURA/MARCATURA" || u === "MARCATURA/VERNICIATURA"
    ? "VERNICIATURA/MARCATURA"
    : a;
}

export function migrateAreas() {
  const c = S.cfg;
  c.areas = [...new Set((c.areas || []).map(normArea))];
  Object.values(S.gestione).forEach((g) => {
    if (g && g.area) g.area = normArea(g.area);
  });
  if (!c.mig2) {
    // una tantum: area COMMERCIALI-SPEDIZIONI eliminata (se la riaggiungi a mano non viene più toccata)
    c.areas = c.areas.filter((a) => a !== "COMMERCIALI-SPEDIZIONI");
    Object.values(S.gestione).forEach((g) => {
      if (g && g.area === "COMMERCIALI-SPEDIZIONI") g.area = "";
    });
    c.mig2 = true;
  }
  if (!c.mig4) {
    // una tantum: eliminate COLLAUDO, QC, SALDATURA (le commesse passano in automatico)
    ["COLLAUDO", "QC", "SALDATURA"].forEach((a) => {
      c.areas = c.areas.filter((x) => x !== a);
      Object.values(S.gestione).forEach((g) => {
        if (g && g.area === a) g.area = "";
      });
    });
    if (!c.areas.includes("TARGHETTE")) c.areas.push("TARGHETTE");
    c.mig4 = true;
  }
  if (!c.mig5) {
    // owner reali per area: Giuseppe Rossi -> Verniciatura/Marcatura, Valentino -> Targhette
    c.areaOwner = c.areaOwner || {};
    const need = (rx: RegExp, name: string, id: string, color: string) => {
      let o = c.owners.find((x) => rx.test(x.name));
      if (!o) {
        if (c.owners.some((x) => x.id === id)) id += "2";
        o = { id, name, color };
        c.owners.push(o);
      }
      return o.id;
    };
    const gr = need(/giuseppe/i, "Giuseppe Rossi", "GR", "#00d4ff"),
      va = need(/valentino/i, "Valentino", "VA", "#a78bfa");
    if (!c.areaOwner["VERNICIATURA/MARCATURA"]) c.areaOwner["VERNICIATURA/MARCATURA"] = gr;
    if (!c.areaOwner["TARGHETTE"]) c.areaOwner["TARGHETTE"] = va;
    c.mig5 = true;
  }
  if (!c.mig3) {
    if (!c.areas.includes("TARGHETTE")) {
      const i = c.areas.indexOf("VERNICIATURA/MARCATURA");
      c.areas.splice(i + 1, 0, "TARGHETTE");
    }
    c.mig3 = true;
  }
}

export function getWKs(): string[] {
  return [...new Set(S.rows.map((r) => r.wk))].sort();
}

export function reconcileAreas() {
  // una tantum: assegnazioni manuali uguali all'area automatica -> unite
  if (S.cfg.mig4b || !S.rows.length) return;
  const wks = getWKs(),
    last = wks[wks.length - 1],
    seen = new Set<string>();
  let merged = 0,
    kept = 0;
  S.rows
    .filter((r) => r.wk === last)
    .forEach((r) => {
      const g = S.gestione[r.n];
      if (!g || !g.area || seen.has(r.n)) return;
      seen.add(r.n);
      if (g.area === r.area_auto) {
        g.area = "";
        merged++;
      } else kept++;
    });
  S.cfg.mig4b = true;
  saveLocal();
  if (merged + kept)
    showWarn(
      `🧹 Aree: ${merged} assegnazioni manuali coincidevano con l'area automatica e sono state unite; ${kept} restano manuali perché diverse dall'automatica.`,
    );
}

export function fixTarghette(): number | undefined {
  // una tantum: le targhette assegnate a mano a Verniciatura/Marcatura (unificata prima) passano a TARGHETTE
  if (S.cfg.mig3b) return;
  let n = 0;
  S.rows.forEach((r) => {
    const g = S.gestione[r.n];
    if (g && g.area === "VERNICIATURA/MARCATURA" && r.area_auto === "TARGHETTE") {
      g.area = "TARGHETTE";
      n++;
    }
  });
  S.cfg.mig3b = true;
  saveLocal();
  return n;
}

// ── accessori sulle commesse ──
export function isDone(r: Row): boolean {
  const g = S.gestione[r.n];
  return !!((g && g.prio === 6) || (r.concluso && !(g && g.riaperta)));
}

export function G(n: string): Gestione {
  return S.gestione[n] || (S.gestione[n] = { owner: "", prio: 3, area: "", scadint: "", note: "", blocks: [] });
}

export function areaOf(r: { n: string; area_auto?: string }): string {
  return G(r.n).area || r.area_auto || "";
}
export function ownerIdOf(r: Row): string {
  return G(r.n).owner || (S.cfg.areaOwner || {})[areaOf(r)] || "";
}
export function ownerName(r: Row): string {
  const o = S.cfg.owners.find((x) => x.id === ownerIdOf(r));
  return o ? o.name : "—";
}
export const areaCls = (a: string) => "a-" + String(a).replace(/[^A-Za-z0-9-]/g, "_");

export function cwRows(): Row[] {
  return S.rows.filter((r) => r.wk === S.wk);
}
/** Righe della settimana corrente ESCLUSE le commesse marcate come Completate (priorità 6) */
export function cwRowsOpen(): Row[] {
  return cwRows().filter((r) => !isDone(r));
}
/** Solo le commesse marcate come Completate (priorità 6) nella settimana corrente */
export function cwRowsCompletate(): Row[] {
  return cwRows().filter((r) => isDone(r));
}

export function rowOf(n: string): Row | undefined {
  const c = S.rows.filter((r) => r.n === n);
  return c.find((r) => r.wk === S.wk) || c[c.length - 1];
}

export const openBlocks = (n: string) => (G(n).blocks || []).filter((b) => !b.resolved);
