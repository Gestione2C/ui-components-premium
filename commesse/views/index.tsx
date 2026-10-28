import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarClock,
  CalendarRange,
  Compass,
  Euro,
  Factory,
  FileText,
  FolderKanban,
  FolderUp,
  GitCompareArrows,
  ListChecks,
  ReceiptText,
  TrendingUp,
  TriangleAlert,
  Construction,
} from "lucide-react";
import type { ComponentType } from "react";
import Upload from "./Upload";
import Panoramica from "./Panoramica";
import Gestione from "./Gestione";
import Bloccanti from "./Bloccanti";
import Produzione from "./Produzione";
import Scadenze from "./Scadenze";
import Valore from "./Valore";
import Mensile from "./Mensile";
import Azioni from "./Azioni";
import Attenzione from "./Attenzione";
import Scheda from "./Scheda";
import Confronto from "./Confronto";
import Report from "./Report";
import Trend from "./Trend";
import Clienti from "./Clienti";
import Guida from "./Guida";

export interface PageDef {
  id: string;
  label: string;
  icon: LucideIcon;
  group: number;
  Component: ComponentType;
  /** pagina utilizzabile anche senza file caricati */
  standalone?: boolean;
}

export const PAGES: PageDef[] = [
  { id: "upload", label: "Carica file", icon: FolderUp, group: 0, Component: Upload, standalone: true },
  { id: "panoramica", label: "Panoramica", icon: BarChart3, group: 0, Component: Panoramica },
  { id: "gestione", label: "Gestione", icon: FolderKanban, group: 1, Component: Gestione },
  { id: "bloccanti", label: "Bloccanti", icon: Construction, group: 1, Component: Bloccanti },
  { id: "produzione", label: "Produzione", icon: Factory, group: 1, Component: Produzione },
  { id: "scadenze", label: "Scadenze", icon: CalendarClock, group: 1, Component: Scadenze },
  { id: "valore", label: "Valore", icon: Euro, group: 1, Component: Valore },
  { id: "mensile", label: "Avanzamento mensile", icon: CalendarRange, group: 1, Component: Mensile },
  { id: "azioni", label: "Azioni riunione", icon: ListChecks, group: 1, Component: Azioni },
  { id: "attenzione", label: "Attenzione", icon: TriangleAlert, group: 1, Component: Attenzione },
  { id: "scheda", label: "Scheda cliente", icon: ReceiptText, group: 1, Component: Scheda },
  { id: "confronto", label: "Confronto WK", icon: GitCompareArrows, group: 1, Component: Confronto },
  { id: "report", label: "Report riunione", icon: FileText, group: 1, Component: Report },
  { id: "trend", label: "Trend WK", icon: TrendingUp, group: 2, Component: Trend },
  { id: "clienti", label: "Clienti", icon: Building2, group: 2, Component: Clienti },
  { id: "guida", label: "Guida criticità", icon: Compass, group: 3, Component: Guida, standalone: true },
];
