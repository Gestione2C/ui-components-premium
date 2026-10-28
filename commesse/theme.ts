/** Palette dell'analizzatore (stessi valori dei token CSS in commesse.css). Usata dai grafici Chart.js. */
export const P = {
  accent: "#22d3ee",
  ok: "#34d399",
  bad: "#fb7185",
  warn: "#fbbf24",
  orange: "#fb923c",
  info: "#a78bfa",
  pink: "#f472b6",
  mute: "#7384a3",
  tick: "#9aa8c4",
  grid: "rgba(255,255,255,.06)",
  critical: "#ff1744",
} as const;

/** Colore di default delle aree note (le aree create dall'utente usano `cfg.areaColors`). */
export const AREA_DEFAULT: Record<string, string> = {
  "VERNICIATURA/MARCATURA": P.accent,
  TARGHETTE: P.info,
  ASSEMBLAGGIO: P.ok,
  LAVORAZIONI: P.warn,
};
