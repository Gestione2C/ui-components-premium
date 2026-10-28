import React from "react";
import { SparklesCore } from "@/components/sparkles";
import { Check } from "lucide-react";

/** Stato "tutto in ordine" con scintille (SparklesCore di ui-components-premium). */
export default function AllGood({ children }: { children: React.ReactNode }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => setOn(!window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-cm-ok/25 bg-cm-ok/[0.06] px-4 py-3 text-[12.5px] text-cm-ok">
      {on && (
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={60}
          speed={1.2}
          particleColor="#34d399"
          className="no-print pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
      <Check size={16} className="relative shrink-0" aria-hidden="true" />
      <span className="relative">{children}</span>
    </div>
  );
}
