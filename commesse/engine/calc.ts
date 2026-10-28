import type { Azione, DetLine, DetOrder, Row } from "./types";
import { G, S, areaOf, cwRows, cwRowsOpen, isDone, openBlocks } from "./state";
import { DET_AREA } from "./parse";
import { fmtD, mkM } from "./util";

// ════════════════════════════════════════
// Valore delle righe d'ordine
// ════════════════════════════════════════
export const inCur = (l: DetLine) => !!(l.piano && l.mk && l.mk > 0 && l.mk <= mkM(S.refDate));
export const prOf = (l: DetLine): number =>
  l.piano
    ? l.stato === "DONE" || inCur(l)
      ? (l.imp as number)
      : 0
    : l.ir != null
      ? l.ir
      : l.stato === "DONE"
        ? (l.imp as number)
        : (l.imp as number) * (l.compl || 0);
export const isFin = (l: DetLine) => l.stato === "DONE" || inCur(l) || (l.compl != null && l.compl >= 0.999);

export interface Val {
  tot: number;
  pr: number;
  res: number;
  cl: number;
  nop: number;
  imp: number;
  nr: number;
  nd: number;
  pa: number;
  po: number;
}

export function valOf(r: Row): Val {
  let tot = 0,
    pr = 0,
    cl = 0,
    nop = 0,
    imp = 0,
    nr = 0,
    nd = 0,
    pa = 0,
    po = 0;
  (r.det as DetOrder).rows.forEach((l) => {
    pa++;
    if (isFin(l)) po++;
    if (!l.dup) {
      nr++;
      if (isFin(l)) nd++;
    }
    if (l.imp == null) {
      if (!l.dup) nop++;
      return;
    }
    tot += l.imp;
    pr += prOf(l);
    if (!l.np) imp += l.imp;
    if (/c\/lav/i.test(l.note)) cl += l.imp;
  });
  return { tot, pr, res: tot - pr, cl, nop, imp, nr, nd, pa, po };
}

// ════════════════════════════════════════
// Avanzamento mensile
// ════════════════════════════════════════
export const kpiT = () => Object.assign({ av: 75, pun: 80, rit: 30 }, S.cfg.kpiT || {});

export interface MensMonth {
  k: number;
  n: number;
  conc: number;
  parz: number;
  ok: number;
  rit: number;
  righe: number;
  tot: number;
  pr: number;
  rs: Row[];
}
export interface MensCell {
  t: number;
  c: number;
  res: number;
}
export interface MensND {
  righe: number;
  tot: number;
  pr: number;
}

export function computeMens() {
  const T = kpiT(),
    ref = S.refDate,
    M: Record<number, MensMonth> = {};
  const PI = !!(S.det && S.det.piano),
    bk = (d: Date) => {
      const k = mkM(d);
      return PI && k < mkM(ref) ? 1 : k;
    }; // nel Piano le scadenze già passate vanno in "Arretrato"
  const g = (k: number): MensMonth =>
    M[k] || (M[k] = { k, n: 0, conc: 0, parz: 0, ok: 0, rit: 0, righe: 0, tot: 0, pr: 0, rs: [] });
  cwRows().forEach((r) => {
    const d = r.concl_orig;
    if (!d) return;
    const m = g(bk(d));
    m.n++;
    m.rs.push(r);
    if (isDone(r)) m.conc++;
    else if (r.in_ritardo) m.rit++;
    else if (r.stato_key === "parz") m.parz++;
    else m.ok++;
  });
  let scad = 0,
    nop = 0;
  const ND: MensND = { righe: 0, tot: 0, pr: 0 },
    P: Record<string, Record<number, MensCell>> = {},
    NP: Record<string, { n: number; tot: number }> = {};
  const DM = new Set<DetOrder>();
  S.rows.forEach((r) => {
    if (r.det) DM.add(r.det);
  });
  const exN = S.det
    ? Object.values(S.det.by)
        .filter((o) => !DM.has(o))
        .reduce((x, o) => x + o.rows.filter((l) => !l.dup).length, 0)
    : 0;
  if (S.det)
    DM.forEach((o) =>
      o.rows.forEach((l) => {
        const dk = PI ? l.concl : l.scad,
          k = dk ? bk(dk) : 0,
          m: MensND = k ? g(k) : ND;
        m.righe++; // Piano: il mese è la scadenza dell'ordine, non il mese di impegno
        if (l.np) {
          const cc = DET_AREA[l.cat] || l.cat || "Non classificata",
            q = (NP[cc] = NP[cc] || { n: 0, tot: 0 });
          q.n++;
          q.tot += l.imp || 0;
        }
        if (l.imp == null) nop++;
        else {
          const pr = prOf(l);
          m.tot += l.imp;
          m.pr += pr;
          if (l.scad && l.scad < ref && l.imp - pr > 0.5) scad += l.imp - pr;
        }
        if (l.compl != null) {
          const c = DET_AREA[l.cat] || l.cat || "Non classificata";
          const x = ((P[c] = P[c] || {})[k] = P[c][k] || { t: 0, c: 0, res: 0 });
          x.t++;
          x.c += PI ? (isFin(l) ? 1 : 0) : l.compl;
          if (l.imp != null) x.res += l.imp * (1 - l.compl);
        }
      }),
    );
  const ks = Object.keys(M)
      .map(Number)
      .filter((k) => k > 1)
      .sort((a, b) => a - b),
    all: number[] = [];
  if (ks.length) {
    for (let y = Math.floor(ks[0] / 100), mo = ks[0] % 100; y * 100 + mo <= ks[ks.length - 1]; ) {
      all.push(y * 100 + mo);
      if (++mo > 12) {
        mo = 1;
        y++;
      }
    }
  }
  if (M[1]) all.unshift(1);
  all.forEach((k) => g(k));
  const A = all.map((k) => M[k]),
    has = !!S.det;
  const TT = A.reduce((a, m) => ({ tot: a.tot + m.tot, pr: a.pr + m.pr }), { tot: ND.tot, pr: ND.pr });
  TT.tot = A.reduce((a, m) => a + m.tot, 0) + ND.tot;
  TT.pr = A.reduce((a, m) => a + m.pr, 0) + ND.pr;
  const TD = PI
      ? A.filter((m) => m.k <= mkM(ref)).reduce((a, m) => ({ tot: a.tot + m.tot, pr: a.pr + m.pr }), { tot: 0, pr: 0 })
      : TT,
    av = TD.tot ? (TD.pr / TD.tot) * 100 : 0;
  const sc = cwRows().filter((r) =>
      isDone(r) ? (r.concl || r.concl_orig) && ((r.concl || r.concl_orig) as Date) < ref : r.in_ritardo,
    ),
    pun = sc.length ? (sc.filter(isDone).length / sc.length) * 100 : null;
  const op = cwRowsOpen(),
    ritN = op.filter((r) => r.in_ritardo).length,
    rit = op.length ? (ritN / op.length) * 100 : 0;
  const dm = Object.values(P).reduce<{ t: number; c: number }>(
      (a, o) => {
        Object.values(o).forEach((x) => {
          a.t += x.t;
          a.c += x.c;
        });
        return a;
      },
      { t: 0, c: 0 },
    ),
    pm = dm.t ? (dm.c / dm.t) * 100 : null;
  return { T, ref, M, PI, A, all, ND, NP, P, scad, nop, exN, TT, TD, av, sc, pun, op, ritN, rit, dm, pm, has, cur: mkM(ref) };
}
export type Mens = ReturnType<typeof computeMens>;

// ════════════════════════════════════════
// Confronto tra settimane
// ════════════════════════════════════════
export const CMP_ORDER = [
  "Nuova",
  "Chiusa",
  "Riaperta",
  "Stato cambiato",
  "Scadenza spostata",
  "Scadenza anticipata",
  "Data prevista cambiata",
  "Commento aggiornato",
];
export interface CmpItem {
  t: string;
  n: string;
  cli: string;
  d: string;
}
export function cmpWeeks(a: string, b: string): CmpItem[] {
  const A: Record<string, Row> = {},
    B: Record<string, Row> = {};
  S.rows.filter((r) => r.wk === a).forEach((r) => (A[r.n] = r));
  S.rows.filter((r) => r.wk === b).forEach((r) => (B[r.n] = r));
  const L: CmpItem[] = [],
    f = (x: Date | null) => (x ? fmtD(x) : "—"),
    add = (t: string, r: Row, d: string) => L.push({ t, n: r.n, cli: r.cliente, d });
  for (const n in B) {
    const rb = B[n],
      ra = A[n];
    if (!ra) {
      if (!isDone(rb)) add("Nuova", rb, `${rb.stato}${rb.concl_orig ? " · prevista " + f(rb.concl_orig) : ""}`);
      continue;
    }
    const da = isDone(ra),
      db = isDone(rb);
    if (!da && db) {
      add("Chiusa", rb, "conclusa");
      continue;
    }
    if (da && !db) add("Riaperta", rb, "era conclusa");
    if (db) continue;
    if (ra.stato !== rb.stato) add("Stato cambiato", rb, `${ra.stato} → ${rb.stato}`);
    const ca = ra.concl_orig,
      cb = rb.concl_orig;
    if ((ca && cb && ca.getTime() !== cb.getTime()) || !ca !== !cb) {
      const dd = ca && cb ? Math.round((+cb - +ca) / 86400000) : 0;
      add(
        dd > 0 ? "Scadenza spostata" : dd < 0 ? "Scadenza anticipata" : "Data prevista cambiata",
        rb,
        `${f(ca)} → ${f(cb)}${dd ? ` (${dd > 0 ? "+" : ""}${dd} gg)` : ""}`,
      );
    }
    if ((ra.commento || "") !== (rb.commento || "") && rb.commento) add("Commento aggiornato", rb, rb.commento.slice(0, 100));
  }
  for (const n in A) if (!B[n] && !isDone(A[n])) add("Chiusa", A[n], "non più presente nel file");
  return L.sort((x, y) => CMP_ORDER.indexOf(x.t) - CMP_ORDER.indexOf(y.t));
}

// ════════════════════════════════════════
// Bloccanti per area (usato dal report)
// ════════════════════════════════════════
export interface BlkLine {
  n: string;
  cli: string;
  tipo: string;
  age: number;
  desc: string;
}
export interface BlkArea {
  n: number;
  t: Record<string, number>;
  l: BlkLine[];
}
export function bloccantiPerArea(rows: Row[]): Record<string, BlkArea> {
  const BA: Record<string, BlkArea> = {};
  rows.forEach((r) =>
    openBlocks(r.n).forEach((b) => {
      const ar = areaOf(r) || "Non assegnata",
        o = (BA[ar] = BA[ar] || { n: 0, t: {}, l: [] });
      o.n++;
      o.t[b.tipo] = (o.t[b.tipo] || 0) + 1;
      const age = b.createdAt ? Math.max(0, Math.floor((+S.refDate - +new Date(b.createdAt)) / 864e5)) : 0;
      o.l.push({
        n: r.n.slice(0, 24),
        cli: r.cliente.slice(0, 16),
        tipo: String(b.tipo || "").toLowerCase(),
        age,
        desc: String(b.desc || "").replace(/[«»]/g, "").slice(0, 60),
      });
    }),
  );
  return BA;
}

// ════════════════════════════════════════
// Bloccanti suggeriti dai commenti
// ════════════════════════════════════════
const SUG_RULES: [string, RegExp, string | null][] = [
  ["CLIENTE", /attesa\s+oda\b/i, "In attesa ODA dal cliente"],
  ["CLIENTE", /material\w*\s+(del\s+)?cliente|attesa\s+cre\b/i, null],
  ["DOCUMENTO", /manc\w*\s+(doc\w*|pid)|attesa\s+(ddt|pid|doc\w*|disegn\w*)/i, null],
  [
    "MATERIALE",
    /material\w*\s+manc\w*|manc\w*\s+material\w*|attesa\s+(di\s+)?(material\w*|incoming|colonn\w*|guarnizion\w*|component\w*|box|cavi)|incoming|in\s+arrivo|material\w*\s+in\s+c\/?\s*lav|verifica\s+material\w*/i,
    null,
  ],
  ["TECNICO", /non\s*conformit\w*|problema\s+tecnic\w*|difett\w*|scart\w*/i, null],
  ["FORNITORE", /attesa\s+(da\s+)?fornitor\w*|fornitor\w*\s+in\s+ritardo|ritardo\s+fornitor\w*/i, null],
  ["CLIENTE", /fase\s+(di\s+)?gestione/i, "In fase di gestione (conferma tempi/costi)"],
];
const SUG_ALTRO = /\b(in\s+)?attesa\s+(?!oda)\S.{2,40}/i;

function sugSources(r: Row) {
  const out: { s: string; t: string }[] = [
    { s: "commento", t: r.commento || "" },
    { s: "numero", t: r.n },
  ];
  if (r.det) {
    const seen = new Set<string>();
    r.det.rows.forEach((l) =>
      [l.comm, l.note === "Attesa PID" ? "Attesa PID" : ""].forEach((t) => {
        if (t && t.length > 3 && !seen.has(t)) {
          seen.add(t);
          out.push({ s: "riga " + (l.cod || ""), t });
        }
      }),
    );
  }
  return out;
}
function sugDate(t: string): string {
  const m = t.match(/(\d{1,2})[\/\.](\d{1,2})(?:[\/\.](\d{2,4}))?/);
  if (!m) return "";
  const d = +m[1],
    mo = +m[2];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : S.refDate.getFullYear(),
    x = new Date(y, mo - 1, d);
  return x >= S.refDate ? y + "-" + String(mo).padStart(2, "0") + "-" + String(d).padStart(2, "0") : "";
}
export interface Sug {
  r: Row;
  tipo: string;
  desc: string;
  scad: string;
}
export function computeSug(): Sug[] {
  const out: Sug[] = [];
  cwRowsOpen().forEach((r) => {
    const g = S.gestione[r.n] || ({} as any),
      have = new Set((g.blocks || []).filter((b: any) => !b.resolved).map((b: any) => b.tipo)),
      ign = new Set(g.sugIgn || []),
      got = new Set<string>();
    sugSources(r).forEach((src) => {
      if (!src.t) return;
      let hit: { tipo: string; m: RegExpMatchArray; lab: string | null } | null = null;
      for (const [tipo, re, lab] of SUG_RULES) {
        const m = src.t.match(re);
        if (m) {
          hit = { tipo, m, lab };
          break;
        }
      }
      if (!hit) {
        const m = src.t.match(SUG_ALTRO);
        if (m) hit = { tipo: "ALTRO", m, lab: null };
      }
      if (!hit || got.has(hit.tipo) || have.has(hit.tipo) || ign.has(hit.tipo)) return;
      got.add(hit.tipo);
      const h = hit;
      const seg = (src.t.split(/\s[-–]\s|\n/).find((x) => x.toLowerCase().includes(h.m[0].toLowerCase())) || h.m[0]).trim().slice(0, 90);
      out.push({ r, tipo: hit.tipo, desc: (hit.lab ? hit.lab + " — " : "") + "«" + seg + "» (" + src.s + ")", scad: sugDate(src.t) });
    });
  });
  return out.sort((a, b) => (b.r.in_ritardo ? b.r.ritardo : 0) - (a.r.in_ritardo ? a.r.ritardo : 0));
}

// ════════════════════════════════════════
// Azioni di riunione
// ════════════════════════════════════════
export function azioni(): Azione[] {
  return (S.cfg.azioni = S.cfg.azioni || []);
}
export const azScad = (a: Azione) => !!(a.due && !a.done && new Date(a.due + "T23:59:59") < (S.refDate || new Date()));
export const azOpen = () => azioni().filter((a) => !a.done).sort((x, y) => ((x.due || "9") < (y.due || "9") ? -1 : 1));

/** Punteggio di criticità usato nel report ("da decidere oggi") */
export const critScore = (r: Row) =>
  (r.in_ritardo ? r.ritardo : 0) + 40 * openBlocks(r.n).length + ((G(r.n).prio || 5) <= 2 ? 60 : 0);
