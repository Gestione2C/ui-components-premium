import { useSyncExternalStore } from "react";
import { S, getVersion, subscribe } from "../engine/state";

/** Sottoscrive il componente allo stato condiviso `S`: si ri-renderizza a ogni `emit()`. */
export function useS() {
  useSyncExternalStore(subscribe, getVersion);
  return S;
}
