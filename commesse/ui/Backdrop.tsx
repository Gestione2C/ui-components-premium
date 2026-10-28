import React from "react";
import { DottedGlowBackground } from "@/components/dotted-glow-background";

/** Sfondo vivo e discreto (punti che si accendono) dietro tutta l'app. Disattivato con "riduci movimento". */
export default function Backdrop() {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOn(!m.matches);
    const h = () => setOn(!m.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);
  if (!on) return null;
  return (
    <div className="no-print pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <DottedGlowBackground
        className="pointer-events-none"
        gap={22}
        radius={1.3}
        color="rgba(154,168,196,0.35)"
        darkColor="rgba(154,168,196,0.35)"
        glowColor="rgba(34,211,238,0.9)"
        darkGlowColor="rgba(34,211,238,0.9)"
        opacity={0.55}
        speedMin={0.2}
        speedMax={0.9}
      />
    </div>
  );
}
