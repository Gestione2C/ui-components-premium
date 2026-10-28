import { useSyncExternalStore } from "react";

/** Stato minimale per i due overlay globali (scheda commessa, configurazione). */
const state = { commessa: null as string | null, settings: false };
let v = 0;
const ls = new Set<() => void>();
const sub = (l: () => void) => {
  ls.add(l);
  return () => ls.delete(l);
};
const bump = () => {
  v++;
  ls.forEach((l) => l());
};
export const openModal = (n: string) => {
  state.commessa = n;
  bump();
};
export const closeModal = () => {
  state.commessa = null;
  bump();
};
export const openSettings = () => {
  state.settings = true;
  bump();
};
export const closeSettings = () => {
  state.settings = false;
  bump();
};
export function useOverlays() {
  useSyncExternalStore(sub, () => v);
  return { ...state };
}
