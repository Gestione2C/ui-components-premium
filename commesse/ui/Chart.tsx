import { useEffect, useRef } from "react";
import { Chart, registerables, type ChartConfiguration } from "chart.js";
import { P } from "../theme";

Chart.register(...registerables);
Chart.defaults.color = P.tick;
Chart.defaults.font.family = "'Fira Code', ui-monospace, monospace";
Chart.defaults.font.size = 11;

/** Etichette dei valori sulle barre (grafico "Top ritardi" e trend con poche settimane). */
export const valLabels = {
  id: "valLabels",
  afterDatasetsDraw(ch: any, _a: any, o: any) {
    const c = ch.ctx;
    c.save();
    c.fillStyle = "#c9d6e6";
    c.font = "11px 'Fira Code', ui-monospace, monospace";
    ch.data.datasets.forEach((d: any, i: number) =>
      ch.getDatasetMeta(i).data.forEach((b: any, j: number) => {
        const v = d.data[j];
        if (v == null) return;
        if (o && o.horizontal) {
          c.textAlign = "left";
          c.fillText(v + " gg", b.x + 6, b.y + 4);
        } else {
          c.textAlign = "center";
          c.fillText(v, b.x, b.y - 6);
        }
      }),
    );
    c.restore();
  },
};

/** Asse/griglia standard (colori del tema). */
export const tick = { color: P.tick };
export const gridY = { color: P.grid };
export const noGrid = { display: false };

/**
 * Wrapper React di Chart.js. La configurazione viene ricostruita a ogni render:
 * il grafico viene aggiornato sul posto (o ricreato se cambia `type`).
 */
export function ChartCanvas({ config, height = 200, label }: { config: ChartConfiguration | any; height?: number; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);
  const kind = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!ref.current) return;
    if (chart.current && kind.current !== config.type) {
      chart.current.destroy();
      chart.current = null;
    }
    if (!chart.current) {
      chart.current = new Chart(ref.current, config);
      kind.current = config.type;
    } else {
      chart.current.data = config.data;
      chart.current.options = config.options;
      chart.current.update();
    }
  });
  useEffect(
    () => () => {
      chart.current?.destroy();
      chart.current = null;
    },
    [],
  );

  return (
    <div className="relative w-full" style={{ height }}>
      <canvas ref={ref} role="img" aria-label={label} />
    </div>
  );
}
