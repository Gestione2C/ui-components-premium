import React from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "motion/react";
import { FileSpreadsheet, FolderUp, Info, X } from "lucide-react";
import { Button as StatefulButton } from "@/components/stateful-button";
import { MultiStepLoader } from "@/components/multi-step-loader";
import { FlipWords } from "@/components/flip-words";
import { Spotlight } from "@/components/spotlight-new";
import { GridPattern } from "@/components/file-upload";
import { S } from "../engine/state";
import { handleFiles, removeFile, runParse } from "../engine/actions";
import { Card, PageHeader } from "../ui/primitives";
import { useS } from "../ui/useS";
import { useGo } from "../ui/go";
import { cn } from "@/lib/utils";

const STEPS = [
  { text: "Lettura dei file Excel" },
  { text: "Riconoscimento colonne, date e colori di riga" },
  { text: "Aggancio delle righe d'ordine alle commesse" },
  { text: "Calcolo di ritardi e scadenze" },
  { text: "Unificazione dei clienti e preparazione dei grafici" },
];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Upload() {
  useS();
  const go = useGo();
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    onDrop: (f) => handleFiles(f),
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls", ".csv"],
      "application/vnd.ms-excel.sheet.macroEnabled.12": [".xlsm"],
      "text/csv": [".csv"],
    },
  });

  const [loading, setLoading] = React.useState(false);
  const analyze = async () => {
    setLoading(true);
    // il calcolo è quasi istantaneo: i passaggi restano visibili abbastanza da essere letti
    const [res] = await Promise.all([runParse(), sleep(2300)]);
    setLoading(false);
    if (res.ok > 0) go("panoramica");
  };

  return (
    <div>
      <MultiStepLoader loadingStates={STEPS} loading={loading} duration={430} loop={false} />
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-cm-line bg-cm-surface/80 px-6 py-7">
        <Spotlight />
        <div className="relative">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
            <FolderUp size={26} className="text-cm-accent" aria-hidden="true" />
            Carica file commesse
          </h1>
          <div className="mt-2 text-[15px] text-cm-muted">
            Capisci subito dove sono{" "}
            <FlipWords words={["i ritardi", "i bloccanti", "le scadenze", "il valore da consegnare", "il carico dei reparti"]} className="!px-1 font-semibold text-cm-accent" />
          </div>
        </div>
      </div>
      <div
        {...getRootProps()}
        onClick={open}
        className={cn(
          "group relative mb-3 cursor-pointer overflow-hidden rounded-2xl border-[1.5px] border-dashed bg-cm-surface px-6 py-12 text-center transition-colors duration-200",
          isDragActive ? "border-cm-accent bg-cm-accent/[0.04]" : "border-cm-line2 hover:border-cm-accent",
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}
        aria-label="Trascina qui i file delle commesse o premi per sceglierli"
      >
        <input {...getInputProps()} />
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]">
          <GridPattern />
        </div>
        <motion.div animate={{ y: isDragActive ? -4 : 0 }} className="relative">
          <FolderUp size={34} className="mx-auto mb-2 text-cm-accent" />
          <div className="mb-1 text-base font-semibold">Trascina i file delle commesse qui</div>
          <div className="text-[13px] text-cm-muted">
            Supporta <span className="mono text-cm-accent">.xlsx</span> · <span className="mono text-cm-accent">.xls</span> ·{" "}
            <span className="mono text-cm-accent">.xlsm</span> · <span className="mono text-cm-accent">.csv</span> — più file contemporaneamente, ogni file = una settimana
          </div>
        </motion.div>
      </div>

      {S.files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {S.files.map((f, i) => (
            <div key={f.name} className="mono flex items-center gap-2 rounded-full border border-cm-line2 bg-cm-surface2 py-1 pl-2.5 pr-1.5 text-[11.5px]">
              <span className={cn("h-1.5 w-1.5 rounded-full", f.ok === false ? "bg-cm-bad" : "bg-cm-ok")} />
              <FileSpreadsheet size={13} className="text-cm-faint" />
              <span>{f.name}</span>
              <span className="text-cm-accent">[{f.kind === "det" ? "RIGHE" : f.wk}]</span>
              <button type="button" aria-label={"Rimuovi " + f.name} onClick={() => removeFile(i)} className="cursor-pointer rounded-full p-0.5 text-cm-faint hover:text-cm-bad">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {S.files.length > 0 && (
        <StatefulButton
          onClick={analyze}
          className="!rounded-lg !bg-cm-accent !px-5 !py-2.5 font-cmmono text-xs font-bold !text-[#04222a] hover:!ring-cm-accent"
        >
          Analizza file
        </StatefulButton>
      )}
      {S.status && (
        <div className={cn("mono mt-3 text-xs", S.statusKind === "ok" ? "text-cm-ok" : "text-cm-bad")}>{S.status}</div>
      )}

      <Card className="mt-5" title={<><Info size={14} /> Come funziona</>}>
        <ol className="mono space-y-1.5 text-xs leading-relaxed text-cm-muted">
          <li>1. Carica uno o più file <strong className="text-cm-ink">.xlsx</strong> (es. COMMESSE_APERTE_2026_WK20.xlsx)</li>
          <li>2. Il sistema rileva automaticamente colonne: N., Data, Concl. prevista, Cliente, Stato, Note</li>
          <li>3. Premi <strong className="text-cm-ink">Analizza file</strong> per caricare i dati nella dashboard</li>
          <li>4. Vai in <strong className="text-cm-ink">Gestione</strong> → apri una commessa per assegnare owner, area, priorità e bloccanti</li>
          <li>5. I dati gestionali vengono salvati localmente e si possono esportare/importare con i pulsanti in alto</li>
        </ol>
      </Card>
    </div>
  );
}
