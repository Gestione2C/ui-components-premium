import * as XLSX from "xlsx";
import type { Det, DetLine, DetOrder, DetStats, FileEntry, RawRow, Row, Colore } from "./types";
import { S, isDone, getWKs, fixTarghette, checkBackup, reconcileAreas } from "./state";
import { mkM, pd } from "./util";

// ════════════════════════════════════════
// Lettura dei file Excel
// ════════════════════════════════════════

/** Colore di riga -> etichetta (azzurro=targhette, rosa=verniciatura, verde=concluse). Basato sulla tinta, non su un valore esatto. */
function colorTag(c: any): Colore {
  const f = c && c.s && c.s.patternType === "solid" && c.s.fgColor;
  if (!f || !f.rgb) return null;
  const h = String(f.rgb).slice(-6),
    r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  const mx = Math.max(r, g, b),
    mn = Math.min(r, g, b),
    d = mx - mn;
  if (!mx || d / mx < 0.15) return null; // bianco / grigi
  let hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue = (hue * 60 + 360) % 360;
  return hue >= 170 && hue <= 220 ? "azzurro" : hue >= 70 && hue <= 160 ? "verde" : hue >= 5 && hue <= 45 ? "rosa" : null;
}

// ── File "Movimenti": una riga per posizione d'ordine (scadenza, % completamento, categoria)
export const DET_AREA: Record<string, string> = {
  TARGHETTE: "TARGHETTE",
  VERNICIATURE: "VERNICIATURA/MARCATURA",
  MECCANICHE: "LAVORAZIONI",
  ASSIEME: "ASSEMBLAGGIO",
};

export function preKey(n: any): string | null {
  const m = String(n || "").match(/^\s*(\d{4,6})/);
  return m ? m[1] : null;
}

function detStats(rows: DetLine[]): DetStats {
  const R0 = rows.filter((r) => !r.dup),
    tr = R0.filter((r) => r.compl != null),
    pend = tr.filter((r) => (r.compl as number) < 0.999);
  const dp = rows
      .filter((r) => r.compl != null && (r.compl as number) < 0.999)
      .map((r) => r.scad)
      .filter(Boolean) as Date[],
    da = rows.map((r) => r.scad).filter(Boolean) as Date[],
    use = dp.length ? dp : da;
  const cnt: Record<string, number> = {};
  R0.forEach((r) => {
    if (r.cat) cnt[r.cat] = (cnt[r.cat] || 0) + 1;
  });
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
  return {
    tot: R0.length,
    tracked: tr.length,
    untracked: R0.length - tr.length,
    done: tr.length - pend.length,
    pending: pend.length,
    pct: tr.length ? Math.round((100 * tr.reduce((x, r) => x + (r.compl as number), 0)) / tr.length) : null,
    prossima: use.length ? new Date(Math.min(...use.map(Number))) : null,
    ultima: use.length ? new Date(Math.max(...use.map(Number))) : null,
    area: top ? DET_AREA[top[0]] || "" : "",
    cats: cnt,
  };
}

// Formato "Movimenti con mesi" (colonne Ottobre/Novembre/Dicembre + % Compl. + Cat.; righe rosse = completate)
function parseMovNew(ws: XLSX.WorkSheet, raw: any[][], hdr: number, H: string[], fname: string): Det {
  const ix = (k: string) => H.findIndex((h) => h === k || h.startsWith(k)),
    CT: Record<string, string> = {
      "MECC.": "MECCANICHE",
      "TARGH.": "TARGHETTE",
      "VER.": "VERNICIATURE",
      "ASS.": "ASSIEME",
      "MONT.": "ASSIEME",
      "TRATT.": "TRATTAMENTI",
      "LOG.": "LOGISTICA",
    };
  const catOf = (v: any) =>
    CT[
      String(v || "")
        .trim()
        .toUpperCase()
        .replace(/:/g, ".")
        .replace(/0/g, "O")
        .split("+")[0]
        .trim()
    ] || "";
  const lastIx = (k: string) => {
    let r = -1;
    H.forEach((h, i) => {
      if (h === k) r = i;
    });
    return r;
  };
  const c = {
    prod: ix("prodotto"),
    qta: ix("impegnato"),
    imp: ix("importo riga"),
    causale: lastIx("causale"),
    concl: ix("concl. prevista"),
    cat: Math.max(H.indexOf("cat."), H.indexOf("linea")),
    cli: ix("cliente"),
    nota: ix("note"),
    com2: ix("commento"),
    cod: Math.max(H.indexOf("cod."), 0),
    done: H.findIndex((h) => /^(completat|fatto)/.test(h)),
  };
  const MN = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const mc = MN.map((n, i) => ({ i, c: H.findIndex((h) => h === n || h === n.slice(0, 3) + ".") })).filter((x) => x.c >= 0);
  const dm = String(fname).match(/(20\d{2})(\d{2})(\d{2})/),
    yr = dm ? +dm[1] : new Date().getFullYear(),
    fm = dm ? +dm[2] - 1 : 9;
  const off = XLSX.utils.decode_range(ws["!ref"] as string).s.r,
    num = (v: any) => (typeof v === "number" ? v : null),
    by: Record<string, DetOrder> = {};
  let nRows = 0,
    nRed = 0,
    cur = "",
    fatt: { v: number; t: string } | null = null;
  const isRed = (i: number) => {
    try {
      const cl: any = ws[XLSX.utils.encode_cell({ r: i + off, c: 0 })],
        f = cl && cl.s && (cl.s.fgColor || cl.s.bgColor);
      return !!(f && /FF0000$/i.test(String(f.rgb || "")));
    } catch (e) {
      return false;
    }
  };
  for (let i = hdr + 1; i < raw.length; i++) {
    const r = raw[i];
    if (!r) continue;
    if (typeof r[c.cod] === "string" && /^Fatturato/i.test(r[c.cod])) {
      if (num(r[c.imp]) != null) fatt = { v: num(r[c.imp]) as number, t: r[c.cod] };
      continue;
    }
    if (typeof r[c.cod] === "string" && /^Ordine cl\./i.test(r[c.cod])) {
      cur = catOf(r[c.cat]);
      continue;
    }
    const m = String(r[c.causale] || "").match(/Ordine cl\.\s*(.+?)\s+del\s/i);
    if (!m) continue;
    const ord = m[1].trim(),
      key = preKey(ord);
    if (!key) continue;
    const red = isRed(i),
      dn = red || (c.done >= 0 && /^(si|sì|x|1|ok|fatto)/i.test(String(r[c.done] || "").trim()));
    if (dn) nRed++;
    const imp = num(r[c.imp]),
      cat = catOf(r[c.cat]) || cur;
    const txt = [r[c.nota], r[c.com2]].filter((x) => x != null && x !== "").join(" ").trim(),
      isCL = /c\/lav/i.test(txt);
    let parts = mc
      .map((x) => ({
        f: num(r[x.c + 1]),
        d: (() => {
          const Y = yr + (x.i < fm - 3 ? 1 : 0),
            v = pd(r[x.c]);
          return new Date(Y, x.i, v ? v.getDate() : new Date(Y, x.i + 1, 0).getDate());
        })(),
      }))
      .filter((x) => (x.f as number) > 0) as { f: number; d: Date | null }[];
    let rem = 1;
    parts = parts.map((x) => {
      const f = Math.min(x.f, rem);
      rem -= f;
      return { f, d: x.d };
    }).filter((x) => x.f > 0.0001);
    if (rem > 0.0001) parts.push({ f: rem, d: null }); // quota della riga senza mese assegnato
    parts.forEach((x, pi) => {
      const im = imp == null ? null : imp * x.f;
      (by[key] = by[key] || { ord, rows: [], stats: undefined as any }).rows.push({
        cod: r[c.cod],
        prod: r[c.prod],
        qta: num(r[c.qta]),
        imp: im,
        ir: im == null ? null : dn ? im : 0,
        scad: x.d,
        compl: dn ? 1 : 0,
        cat,
        sub: "",
        note: isCL ? (txt + " c/lav").trim() : txt,
        comm: "",
        concl: pd(r[c.concl]),
        np: !x.d,
        dup: pi > 0,
        piano: H.includes("linea"),
        mk: x.d ? mkM(x.d) : 0,
      });
      if (pi === 0) nRows++;
    });
  }
  if (!nRed && c.done < 0)
    Object.values(by).forEach((o) =>
      o.rows.forEach((l) => {
        l.compl = null;
        l.ir = null;
      }),
    ); // nessuna informazione di completamento nel file: dato non disponibile
  Object.values(by).forEach((o) => {
    o.stats = detStats(o.rows);
    o.stats.piano = H.includes("linea");
  });
  return {
    detail: true,
    by,
    nRows,
    nOrd: Object.keys(by).length,
    file: fname,
    date: dm ? new Date(+dm[1], +dm[2] - 1, +dm[3]) : null,
    fmt: "mesi",
    piano: H.includes("linea"),
    noDone: !nRed && c.done < 0 && !H.includes("linea"),
    nRed,
    fatt,
  };
}

function parseMovimenti(ws: XLSX.WorkSheet, fname: string): Det {
  const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  const hdr = raw.findIndex((r) => r && r.some((c) => String(c || "").trim() === "Causale"));
  if (hdr < 0) throw new Error('Foglio Movimenti: colonna "Causale" non trovata');
  const H = raw[hdr].map((h) => String(h || "").trim().toLowerCase()),
    ix = (k: string) => H.findIndex((h) => h === k || h.startsWith(k));
  if ((H.includes("cat.") && H.includes("ottobre")) || (H.includes("linea") && H.some((h) => h.startsWith("% ott"))))
    return parseMovNew(ws, raw, hdr, H, fname);
  const c = {
    cod: ix("cod"),
    prod: ix("prodotto"),
    qta: ix("impegnato"),
    imp: ix("importo riga"),
    ir: ix("importo % reale"),
    causale: ix("causale"),
    scad: ix("scadenza"),
    compl: ix("% completamento"),
    cat: ix("categoria"),
    note: ix("note"),
    comm: ix("commento"),
  };
  const num = (v: any) => (typeof v === "number" ? v : null),
    by: Record<string, DetOrder> = {};
  let nRows = 0;
  for (let i = hdr + 1; i < raw.length; i++) {
    const r = raw[i];
    if (!r) continue;
    const m = String(r[c.causale] || "").match(/Ordine cl\.\s*(.+?)\s+del\s/i);
    if (!m) continue;
    const ord = m[1].trim(),
      key = preKey(ord);
    if (!key) continue;
    const cat = String(r[c.cat] || "").split("»");
    (by[key] = by[key] || { ord, rows: [], stats: undefined as any }).rows.push({
      cod: r[c.cod],
      prod: r[c.prod],
      qta: num(r[c.qta]),
      imp: num(r[c.imp]),
      ir: num(r[c.ir]),
      scad: pd(r[c.scad]),
      compl: num(r[c.compl]),
      cat: cat[0].trim().toUpperCase(),
      sub: (cat[1] || "").trim(),
      note: String(r[c.note] || "").trim(),
      comm: String(r[c.comm] || "").trim(),
    });
    nRows++;
  }
  Object.values(by).forEach((o) => (o.stats = detStats(o.rows)));
  const dm = String(fname).match(/(20\d{2})(\d{2})(\d{2})/);
  return {
    detail: true,
    by,
    nRows,
    nOrd: Object.keys(by).length,
    file: fname,
    date: dm ? new Date(+dm[1], +dm[2] - 1, +dm[3]) : null,
  };
}

// Stato per riga (DONE, DELAY, BLOCKED...) dai fogli settimanali W41, W42... del Piano: unisce ordine + codice articolo
function applyStati(d: Det, wb: XLSX.WorkBook) {
  const MAP: Record<string, string> = {};
  let n = 0;
  wb.SheetNames.filter((x) => /^W\d+$/i.test(x)).forEach((x) => {
    const raw: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[x], { header: 1, defval: null, raw: true }),
      H = (raw[0] || []).map((h) => String(h || "").trim().toLowerCase());
    const iS = H.indexOf("stato"),
      iC = H.indexOf("cod."),
      iO = H.indexOf("causale");
    if (iS < 0 || iC < 0 || iO < 0) return;
    raw.slice(1).forEach((r) => {
      const m = String(r[iO] || "").match(/Ordine cl\.\s*(\d{4,6})/i),
        st = String(r[iS] || "").trim().toUpperCase();
      if (m && st) {
        MAP[m[1] + "|" + String(r[iC]).trim()] = st;
        n++;
      }
    });
  });
  Object.entries(d.by).forEach(([k, o]) =>
    o.rows.forEach((l) => {
      const st = MAP[k + "|" + String(l.cod).trim()];
      if (st) l.stato = st;
    }),
  );
  d.nStati = n;
}

export type ParsedFile = RawRow[] | Det;
const isDet = (x: ParsedFile): x is Det => !!x && !Array.isArray(x) && (x as Det).detail === true;

export async function readFile(fObj: FileEntry): Promise<ParsedFile> {
  const buf = await fObj.file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellStyles: true });
  if (wb.SheetNames.includes("Piano")) {
    try {
      const d = parseMovimenti(wb.Sheets["Piano"], fObj.name);
      try {
        applyStati(d, wb);
      } catch (e) {
        /* ignora */
      }
      return d;
    } catch (e) {
      /* cade sul formato successivo */
    }
  }
  if (wb.SheetNames.includes("Movimenti")) return parseMovimenti(wb.Sheets["Movimenti"], fObj.name);
  const sn = wb.SheetNames.includes("Ordini cliente") ? "Ordini cliente" : wb.SheetNames[0];
  const ws = wb.Sheets[sn];
  const r0 = ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]).s.r : 0;
  const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  // find header row
  let hdr = -1;
  for (let i = 0; i < Math.min(10, raw.length); i++) {
    if (raw[i] && raw[i].some((c) => typeof c === "string" && (c.trim() === "N." || c.trim() === "Cliente"))) {
      hdr = i;
      break;
    }
  }
  if (hdr === -1) hdr = 0;
  const headers = raw[hdr].map((h) => (h ? String(h).trim() : ""));
  const cm: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h === "N." || h === "N") cm.n = i;
    else if (h === "Data") cm.data = i;
    else if (h.includes("Concl")) cm.concl = i;
    else if (h === "Cliente") cm.cliente = i;
    else if (h === "Stato") cm.stato = i;
    else if (h.startsWith("Comment")) cm.commento = i;
    else if (h.match(/^NOTE?$/i)) cm.note = i;
  });
  const rows: RawRow[] = [];
  for (let i = hdr + 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[cm.n]) continue;
    const nv = String(row[cm.n] || "").trim();
    if (!nv || /^\d{4}$/.test(nv)) continue;
    rows.push({
      _file: fObj.name,
      n: nv,
      colore: colorTag(ws[XLSX.utils.encode_cell({ r: r0 + i, c: cm.n })]),
      data: pd(row[cm.data]),
      concl: pd(row[cm.concl]),
      cliente: String(row[cm.cliente] || "—").trim(),
      stato: String(row[cm.stato] || "").trim(),
      commento: String(row[cm.commento] || "").trim(),
      note: String(row[cm.note] || "").trim(),
    });
  }
  return rows;
}

// ════════════════════════════════════════
// Arricchimento delle commesse
// ════════════════════════════════════════
const CAT_AREA: Record<string, string> = {
  TARGHETTE: "TARGHETTE",
  VERNICIATURA: "VERNICIATURA/MARCATURA",
  ASSIEMI: "ASSEMBLAGGIO",
  MECCANICA: "LAVORAZIONI",
};
const CAT_RULES: [string, RegExp][] = [
  ["TARGHETTE", /targh|targa|etichett|label|piastrin|laser/i],
  ["ASSIEMI", /assy|assiem|cablat|cablagg|pp fo|kit\b/i],
  ["VERNICIATURA", /vernic|marcatur|incision/i],
  [
    "MECCANICA",
    /meccanic|staff|support|cover|box|piastr|spacer|distanz|case\b|dissipat|coperchio|flangia|raccordo|pompa|cestell|sportell|rilavor|perni|boccol|schermo|lavoraz|tilt|bracket|cilindro|tubo|cooling|scambiat|bulkhead/i,
  ],
];
function categorizza(r: { colore: Colore; commento?: string; note?: string }): string {
  if (r.colore === "azzurro") return "TARGHETTE";
  if (r.colore === "rosa") return "VERNICIATURA";
  const t = (r.commento || "") + " " + (r.note || "");
  for (const [k, re] of CAT_RULES) if (re.test(t)) return k;
  return "ALTRO";
}

export function enrich(rows: any[], wk: string): Row[] {
  return rows
    .filter((r) => !/^\s*26000\b/.test(String(r.n || ""))) // 26000-INT: riferimento interno, ignorato
    .map((r) => {
      const ref = S.refDate;
      const gg = r.data ? Math.floor((+ref - +r.data) / 86400000) : null;
      const st = r.det ? r.det.stats : null;
      const co = r.concl_orig !== undefined ? r.concl_orig : r.concl; // scadenza del file generico
      const cc = S.useDet && st && st.ultima && !st.piano ? st.ultima : co; // nel Piano i mesi sono una pianificazione, non una scadenza
      let ritardo = 0,
        inRit = false;
      if (cc && +ref > +cc) {
        ritardo = Math.floor((+ref - +cc) / 86400000);
        inRit = true;
      }
      const sk = !cc ? "nodata" : r.stato.includes("Parz") ? "parz" : inRit ? "ritardo" : "ok";
      return {
        ...r,
        wk,
        concl_orig: co,
        concl: cc,
        pct: st ? st.pct : null,
        concluso: r.stato.trim().toLowerCase() === "concluso" || r.colore === "verde",
        area_auto: (st && st.area) || CAT_AREA[categorizza(r)] || "",
        gg_apertura: gg,
        ritardo: ritardo,
        in_ritardo: inRit,
        stato_key: sk,
      } as Row;
    });
}

/** Aggancia le righe d'ordine alle commesse dell'ultima settimana (per numero iniziale) */
function attachDet() {
  const d = S.det;
  if (!d) return;
  const files = S.files.filter((f) => f.kind !== "det" && f.parsed),
    wks = [...new Set(files.map((f) => f.wk))].sort(),
    last = wks[wks.length - 1];
  const used = new Set<string>();
  let exact = 0;
  const norm = (x: any) => String(x).replace(/\s+/g, " ").trim();
  files.forEach((f) =>
    (f.parsed as Row[]).forEach((r) => {
      const o = f.wk === last && !r.concluso ? d.by[preKey(r.n) as string] : null; // commesse concluse: righe ignorate
      r.det = o || null;
      if (o && !used.has(preKey(r.n) as string)) {
        used.add(preKey(r.n) as string);
        if (norm(o.ord) === norm(r.n)) exact++;
      }
    }),
  );
  d.matched = used.size;
  d.exact = exact;
  d.unmatched = Object.keys(d.by)
    .filter((k) => !used.has(k))
    .map((k) => d.by[k].ord);
}

export function reEnrich() {
  S.rows = S.files.flatMap((f) => {
    f.parsed = enrich((f.parsed || []).map((r) => ({ ...r })), f.wk);
    return f.parsed;
  });
}

/** Unifica le varianti di scrittura dello stesso cliente. Ritorna quante ne ha unite. */
function unifyClients(): number {
  const key = (x: string) =>
    x
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/[^a-z0-9à-ÿ]+/g, " ")
      .trim();
  const v: Record<string, Record<string, number>> = {};
  S.rows.forEach((r) => {
    const k = key(r.cliente);
    v[k] = v[k] || {};
    v[k][r.cliente] = (v[k][r.cliente] || 0) + 1;
  });
  const best: Record<string, string> = {};
  let merged = 0;
  for (const k in v) {
    const a = Object.entries(v[k]).sort((x, y) => y[1] - x[1]);
    best[k] = a[0][0];
    merged += a.length - 1;
  }
  S.rows.forEach((r) => {
    r.cliente = best[key(r.cliente)];
  });
  return merged;
}

export const guessWK = (name: string) => {
  const m = name.match(/WK(\d+)/i);
  return m ? "WK" + m[1] : name.replace(/\.[^.]+$/, "").slice(0, 14);
};

export interface ParseResult {
  ok: number;
  fail: number;
  errors: string[];
  merged: number;
}

/** Equivalente di parseAll() del vecchio analizzatore (senza parti di interfaccia). */
export async function parseAll(): Promise<ParseResult> {
  S.rows = [];
  S.det = null;
  let ok = 0,
    fail = 0;
  const errors: string[] = [];
  for (const f of S.files) {
    try {
      const raw = await readFile(f);
      if (isDet(raw)) {
        f.kind = "det";
        f.ok = true;
        f.parsed = [];
        S.det = raw;
        ok++;
        continue;
      }
      f.parsed = enrich(raw, f.wk);
      f.ok = true;
      S.rows.push(...f.parsed);
      ok++;
    } catch (e: any) {
      f.ok = false;
      fail++;
      errors.push(`${f.name}: ${e.message}`);
    }
  }
  attachDet();
  reEnrich();
  const merged = unifyClients();
  fixTarghette();
  checkBackup();
  reconcileAreas();
  if (ok > 0) {
    const wks = getWKs();
    S.wk = wks[wks.length - 1];
  }
  return { ok, fail, errors, merged };
}

export { isDone };
