export const BICONS: Record<string, string> = {
  MATERIALE: "📦",
  CLIENTE: "👤",
  FORNITORE: "🏭",
  TECNICO: "⚙",
  DOCUMENTO: "📄",
  ALTRO: "❓",
};
export const BLK_TIPI = ["MATERIALE", "CLIENTE", "FORNITORE", "TECNICO", "DOCUMENTO", "ALTRO"] as const;
export const BLK_LABEL: Record<string, string> = {
  MATERIALE: "Materiale",
  CLIENTE: "Attesa cliente",
  FORNITORE: "Fornitore",
  TECNICO: "Tecnico",
  DOCUMENTO: "Documento",
  ALTRO: "Altro",
};
export const PRIO_COLORS: Record<number, string> = { 1: "#ff1744", 2: "#ff4d6a", 3: "#ffaa00", 4: "#00e5a0", 5: "#445566" };
export const PRIO_LABELS: Record<number, string> = { 1: "Critica", 2: "Alta", 3: "Media", 4: "Bassa", 5: "Sospesa" };
