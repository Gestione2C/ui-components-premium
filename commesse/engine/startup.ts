import { loadLocal, migrateAreas, saveLocal } from "./state";

/** Equivalente della riga di avvio del vecchio file: loadLocal(); migrateAreas(); saveLocal(); */
export function applyStartup() {
  loadLocal();
  migrateAreas();
  saveLocal();
}
