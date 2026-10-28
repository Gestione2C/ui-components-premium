import * as XLSX from "xlsx";

export const fdIt = (d: Date) => d.toLocaleDateString("it-IT");

export function fmtD(d: Date | null | undefined): string {
  if (!d) return "—";
  try {
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return String(d);
  }
}

export const eur = (v: number | null | undefined) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    useGrouping: "always" as any,
  }).format(v || 0);

export const mkM = (d: Date) => d.getFullYear() * 100 + d.getMonth() + 1;

export const lblM = (k: number) =>
  k === 1
    ? "Arretrato"
    : k
      ? new Date(Math.floor(k / 100), (k % 100) - 1, 1).toLocaleDateString("it-IT", { month: "short", year: "2-digit" })
      : "Non pianificate";

/** Parse a cell value into a local-midnight Date (Excel serial, Italian dd/mm/yyyy text, ISO). */
export function pd(v: any): Date | null {
  if (v === null || v === undefined || v === "") return null;
  const loc = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (v instanceof Date) return isNaN(v as any) ? null : loc(v);
  if (typeof v === "number") {
    // seriale Excel: nessuna ambiguità gg/mm
    if (v < 20000 || v > 80000) return null;
    const p = XLSX.SSF.parse_date_code(v);
    return p ? new Date(p.y, p.m - 1, p.d) : null;
  }
  const s = String(v).trim();
  if (!s || s === "null" || s === "—") return null;
  let m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/); // testo: convenzione italiana gg/mm/aaaa
  if (m) {
    const d = +m[1],
      mo = +m[2];
    let y = +m[3];
    if (y < 100) y += 2000;
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return new Date(y, mo - 1, d);
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return isNaN(d as any) ? null : loc(d);
}

/** yyyy-mm-dd for <input type="date"> from a local Date */
export const isoDay = (d: Date) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

export function parseIsoDay(v: string): Date {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
}
