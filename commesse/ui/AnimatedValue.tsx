import React, { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

const RX = /^(\d{1,3}(?:\.\d{3})+|\d+)(\s?(?:%|gg|€| €))?$/;

/** Numero che "conta" da 0 (o dal valore precedente) quando cambia. Valori non numerici restano com'erano. */
export function AnimatedValue({ value }: { value: React.ReactNode }) {
  const parsed =
    typeof value === "number"
      ? { n: value, dots: false, suf: "" }
      : typeof value === "string" && RX.test(value)
        ? (() => {
            const m = value.match(RX)!;
            return { n: +m[1].replace(/\./g, ""), dots: m[1].includes("."), suf: m[2] || "" };
          })()
        : null;
  const [shown, setShown] = useState<number | null>(null);
  const from = useRef(0);
  const target = parsed ? parsed.n : null;
  useEffect(() => {
    if (target == null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(target);
      from.current = target;
      return;
    }
    const c = animate(from.current, target, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => c.stop();
  }, [target]);
  if (!parsed) return <>{value}</>;
  const v = Math.round(shown ?? 0);
  const txt = parsed.dots || parsed.suf.includes("€") ? v.toLocaleString("it-IT", { useGrouping: "always" as any }) : String(v);
  return (
    <span aria-label={String(value)}>
      {txt}
      {parsed.suf}
    </span>
  );
}
