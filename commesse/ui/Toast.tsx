import React from "react";
import { X } from "lucide-react";
import { S, clearWarn } from "../engine/state";
import { cn } from "@/lib/utils";
import { useS } from "./useS";

/** Messaggio fisso in basso a destra (equivalente di showWarn). Il testo può contenere <b>…</b>. */
export default function Toast() {
  useS();
  const w = S.warn;
  if (!w) return null;
  const parts = w.msg.split(/(<b>.*?<\/b>)/g);
  return (
    <div
      role="status"
      className={cn(
        "no-print fixed bottom-4 right-4 z-[400] max-w-sm rounded-xl border bg-[#1a1408] py-2.5 pl-3 pr-9 text-xs leading-snug text-[#ffe0a3] shadow-xl",
        w.danger ? "border-cm-bad" : "border-cm-warn",
      )}
    >
      {parts.map((p, i) => (p.startsWith("<b>") ? <b key={i}>{p.slice(3, -4)}</b> : <span key={i}>{p}</span>))}
      <button type="button" aria-label="Chiudi" onClick={clearWarn} className="absolute right-2 top-2 cursor-pointer opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
