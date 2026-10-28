export type Colore = "azzurro" | "verde" | "rosa" | null;
export type StatoKey = "nodata" | "parz" | "ritardo" | "ok";

export interface RawRow {
  _file: string;
  n: string;
  colore: Colore;
  data: Date | null;
  concl: Date | null;
  cliente: string;
  stato: string;
  commento: string;
  note: string;
}

export interface DetLine {
  cod: any;
  prod: any;
  qta: number | null;
  imp: number | null;
  ir: number | null;
  scad: Date | null;
  compl: number | null;
  cat: string;
  sub: string;
  note: string;
  comm: string;
  concl?: Date | null;
  np?: boolean;
  dup?: boolean;
  piano?: boolean;
  mk?: number;
  stato?: string;
}

export interface DetStats {
  tot: number;
  tracked: number;
  untracked: number;
  done: number;
  pending: number;
  pct: number | null;
  prossima: Date | null;
  ultima: Date | null;
  area: string;
  cats: Record<string, number>;
  piano?: boolean;
}

export interface DetOrder {
  ord: string;
  rows: DetLine[];
  stats: DetStats;
}

export interface Det {
  detail: true;
  by: Record<string, DetOrder>;
  nRows: number;
  nOrd: number;
  file: string;
  date: Date | null;
  fmt?: string;
  piano?: boolean;
  noDone?: boolean;
  nRed?: number;
  fatt?: { v: number; t: string } | null;
  nStati?: number;
  matched?: number;
  exact?: number;
  unmatched?: string[];
}

export interface Row extends RawRow {
  wk: string;
  concl_orig: Date | null;
  pct: number | null;
  concluso: boolean;
  area_auto: string;
  gg_apertura: number | null;
  ritardo: number;
  in_ritardo: boolean;
  stato_key: StatoKey;
  det?: DetOrder | null;
}

export interface Blocco {
  id: string;
  tipo: string;
  desc: string;
  scad: string;
  resolved: boolean;
  createdAt?: string;
  resolvedAt?: string | null;
  auto?: boolean;
}

export interface Gestione {
  owner: string;
  prio: number;
  area: string;
  scadint: string;
  note: string;
  blocks: Blocco[];
  riaperta?: boolean;
  sugIgn?: string[];
}

export interface Owner {
  id: string;
  name: string;
  color: string;
}

export interface Azione {
  id: string;
  t: string;
  who: string;
  due: string;
  n: string;
  done: boolean;
  created: string;
  wk: string;
  doneAt?: string | null;
}

export interface Cfg {
  owners: Owner[];
  areaOwner: Record<string, string>;
  areas: string[];
  areaColors?: Record<string, string>;
  kpiT?: { av: number; pun: number; rit: number };
  azioni?: Azione[];
  [flag: string]: any;
}

export interface FileEntry {
  name: string;
  file: File;
  wk: string;
  ok: boolean | null;
  kind?: "det";
  parsed?: Row[];
}
