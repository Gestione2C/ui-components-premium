// Dati della Guida criticità, estratti automaticamente dal file originale (testo identico).
// I colori `var(--red|orange|green)` di sev_color sono mappati sui token del tema in views/Guida.tsx.
export interface GuidaOpt {
  id: string;
  icon: string;
  title: string;
  desc: string;
  next: string;
}
export interface GuidaQuestion {
  n: number;
  total: number;
  question: string;
  desc?: string;
  opts: GuidaOpt[];
  type?: undefined;
}
export interface GuidaActionRef {
  type: "action";
  scenario: string;
  variant: string;
}
export type GuidaStep = GuidaQuestion | GuidaActionRef;
export interface GuidaFlow {
  label: string;
  steps: Record<string, GuidaStep>;
}
export interface TimelineItem {
  when: string;
  what: string;
  detail?: string;
}
export interface GuidaPlan {
  icon: string;
  title: string;
  severity: string;
  sev_color: string;
  warning?: string;
  tip?: string;
  timeline?: TimelineItem[];
  checks_immediate?: string[];
  checks_followup?: string[];
  escalation?: string;
}

export const FLOWS: Record<string, GuidaFlow> = {
  "ritardo": {
    "label": "⏰ Commessa in ritardo",
    "steps": {
      "start": {
        "n": 1,
        "total": 3,
        "question": "Qual è l'entità del ritardo?",
        "desc": "Valuta i giorni di scarto rispetto alla data di conclusione prevista. Questo determina il livello di urgenza e il tipo di azione richiesta.",
        "opts": [
          {
            "id": "lieve",
            "icon": "🟡",
            "title": "Lieve (1–15 gg)",
            "desc": "Ritardo contenuto, ancora recuperabile con piccoli interventi",
            "next": "causa"
          },
          {
            "id": "medio",
            "icon": "🟠",
            "title": "Medio (16–45 gg)",
            "desc": "Ritardo significativo, richiede piano di recupero strutturato",
            "next": "causa"
          },
          {
            "id": "grave",
            "icon": "🔴",
            "title": "Grave (46–90 gg)",
            "desc": "Ritardo grave, probabile impatto su cliente e reputazione",
            "next": "causa"
          },
          {
            "id": "critico",
            "icon": "🚨",
            "title": "Critico (> 90 gg)",
            "desc": "Situazione critica, rischio perdita ordine o penali contrattuali",
            "next": "causa"
          }
        ]
      },
      "causa": {
        "n": 2,
        "total": 3,
        "question": "Qual è la causa principale del ritardo?",
        "desc": "Identificare la causa radice è il primo passo per applicare l'azione correttiva giusta. Scegli la voce che meglio descrive la situazione.",
        "opts": [
          {
            "id": "mat",
            "icon": "📦",
            "title": "Materiali / componenti mancanti",
            "desc": "Fornitore in ritardo, materiale non ancora ricevuto o in attesa d'ordine",
            "next": "action_mat"
          },
          {
            "id": "cap",
            "icon": "🏭",
            "title": "Capacità produttiva / reparto saturo",
            "desc": "Il reparto assegnato non riesce a processare l'ordine per carico eccessivo",
            "next": "action_cap"
          },
          {
            "id": "tec",
            "icon": "⚙",
            "title": "Problema tecnico / rilavorazione",
            "desc": "Difetti rilevati in produzione, rilavorazioni necessarie, specifiche cambiate",
            "next": "action_tec"
          },
          {
            "id": "cli",
            "icon": "👤",
            "title": "Attesa informazioni / approvazione cliente",
            "desc": "Il cliente non ha fornito dati, disegni, approvazioni o conferme necessarie",
            "next": "action_cli"
          },
          {
            "id": "pla",
            "icon": "📋",
            "title": "Pianificazione / priorità errata",
            "desc": "L'ordine non era stato correttamente prioritizzato o schedulato",
            "next": "action_pla"
          }
        ]
      },
      "action_mat": {
        "type": "action",
        "scenario": "ritardo",
        "variant": "mat"
      },
      "action_cap": {
        "type": "action",
        "scenario": "ritardo",
        "variant": "cap"
      },
      "action_tec": {
        "type": "action",
        "scenario": "ritardo",
        "variant": "tec"
      },
      "action_cli": {
        "type": "action",
        "scenario": "ritardo",
        "variant": "cli"
      },
      "action_pla": {
        "type": "action",
        "scenario": "ritardo",
        "variant": "pla"
      }
    }
  },
  "bloccante": {
    "label": "🚧 Condizione bloccante",
    "steps": {
      "start": {
        "n": 1,
        "total": 3,
        "question": "Che tipo di blocco stai affrontando?",
        "desc": "Identifica la natura del blocco per indirizzarti alle azioni più efficaci. Ogni categoria ha protocolli di sblocco differenti.",
        "opts": [
          {
            "id": "mat",
            "icon": "📦",
            "title": "Materiale mancante o in ritardo da fornitore",
            "desc": "Componente, semilavorato o materia prima non disponibile",
            "next": "blk_mat_urgenza"
          },
          {
            "id": "cli",
            "icon": "👤",
            "title": "Attesa risposta / approvazione cliente",
            "desc": "Nessun feedback su disegni, modifiche o conferme d'ordine",
            "next": "blk_cli_attesa"
          },
          {
            "id": "for",
            "icon": "🏭",
            "title": "Fornitore esterno non risponde / in ritardo",
            "desc": "Lavorazione esterna (verniciatura, trattamento, ecc.) bloccata",
            "next": "blk_for_tipo"
          },
          {
            "id": "tec",
            "icon": "⚙",
            "title": "Problema tecnico o ambiguità di specifica",
            "desc": "Non conformità, errore di disegno, specifica poco chiara",
            "next": "blk_tec_tipo"
          },
          {
            "id": "doc",
            "icon": "📄",
            "title": "Documento o certificazione mancante",
            "desc": "Manuale, dichiarazione di conformità, collaudo da completare",
            "next": "action_blk_doc"
          }
        ]
      },
      "blk_mat_urgenza": {
        "n": 2,
        "total": 3,
        "question": "Quanto è urgente la commessa bloccata da materiale mancante?",
        "desc": "Il livello di urgenza determina le misure straordinarie da attivare.",
        "opts": [
          {
            "id": "urg",
            "icon": "🔴",
            "title": "Urgente — cliente in attesa / scadenza imminente",
            "desc": "Meno di 15 giorni alla data prevista di consegna",
            "next": "action_blk_mat_urg"
          },
          {
            "id": "std",
            "icon": "🟡",
            "title": "Standard — scadenza ancora lontana",
            "desc": "Più di 15 giorni alla data prevista",
            "next": "action_blk_mat_std"
          }
        ]
      },
      "blk_cli_attesa": {
        "n": 2,
        "total": 3,
        "question": "Da quanto tempo aspetti risposta dal cliente?",
        "desc": "La durata dell'attesa determina il tipo di escalation da fare.",
        "opts": [
          {
            "id": "breve",
            "icon": "🟢",
            "title": "Meno di 5 giorni lavorativi",
            "desc": "Attesa nella norma, basta un sollecito standard",
            "next": "action_blk_cli_soft"
          },
          {
            "id": "medio",
            "icon": "🟡",
            "title": "5–15 giorni lavorativi",
            "desc": "Attesa eccessiva, necessario sollecito formale",
            "next": "action_blk_cli_hard"
          },
          {
            "id": "lungo",
            "icon": "🔴",
            "title": "Oltre 15 giorni lavorativi",
            "desc": "Situazione critica, rischio di compromettere la commessa",
            "next": "action_blk_cli_escalation"
          }
        ]
      },
      "blk_for_tipo": {
        "n": 2,
        "total": 3,
        "question": "Qual è la situazione con il fornitore esterno?",
        "opts": [
          {
            "id": "noris",
            "icon": "📵",
            "title": "Non risponde alle comunicazioni",
            "desc": "Email e telefonate senza risposta da più di 3 giorni",
            "next": "action_blk_for_silenzio"
          },
          {
            "id": "rit",
            "icon": "⏳",
            "title": "Risponde ma conferma ritardo",
            "desc": "Il fornitore ha comunicato uno slittamento della data di rientro",
            "next": "action_blk_for_ritardo"
          },
          {
            "id": "kq",
            "icon": "❌",
            "title": "Merce rientrata ma con difetti",
            "desc": "Il materiale lavorato non rispetta le specifiche richieste",
            "next": "action_blk_for_nc"
          }
        ]
      },
      "blk_tec_tipo": {
        "n": 2,
        "total": 3,
        "question": "Qual è la natura del problema tecnico?",
        "opts": [
          {
            "id": "nc",
            "icon": "❌",
            "title": "Non conformità rilevata in produzione",
            "desc": "Il pezzo non rispetta tolleranze, finiture o requisiti",
            "next": "action_blk_tec_nc"
          },
          {
            "id": "spec",
            "icon": "📐",
            "title": "Specifica ambigua o in conflitto",
            "desc": "Il disegno o le istruzioni non sono chiari o si contraddicono",
            "next": "action_blk_tec_spec"
          },
          {
            "id": "dsg",
            "icon": "🔧",
            "title": "Modifica tecnica richiesta dal cliente",
            "desc": "Cambio di specifiche durante la produzione",
            "next": "action_blk_tec_modifica"
          }
        ]
      },
      "action_blk_mat_urg": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "mat_urg"
      },
      "action_blk_mat_std": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "mat_std"
      },
      "action_blk_cli_soft": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "cli_soft"
      },
      "action_blk_cli_hard": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "cli_hard"
      },
      "action_blk_cli_escalation": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "cli_escalation"
      },
      "action_blk_for_silenzio": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "for_silenzio"
      },
      "action_blk_for_ritardo": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "for_ritardo"
      },
      "action_blk_for_nc": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "for_nc"
      },
      "action_blk_tec_nc": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "tec_nc"
      },
      "action_blk_tec_spec": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "tec_spec"
      },
      "action_blk_tec_modifica": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "tec_modifica"
      },
      "action_blk_doc": {
        "type": "action",
        "scenario": "bloccante",
        "variant": "doc"
      }
    }
  },
  "nodata": {
    "label": "❓ Commessa senza data",
    "steps": {
      "start": {
        "n": 1,
        "total": 2,
        "question": "Perché questa commessa non ha una data di conclusione?",
        "opts": [
          {
            "id": "att",
            "icon": "👤",
            "title": "In attesa di conferma d'ordine dal cliente",
            "desc": "ODA non ancora ricevuto, trattativa in corso",
            "next": "action_nd_att"
          },
          {
            "id": "dim",
            "icon": "🗃",
            "title": "Ordine dimenticato / non inserito nel sistema",
            "desc": "La commessa esiste ma nessuno ha pianificato la scadenza",
            "next": "action_nd_dim"
          },
          {
            "id": "indet",
            "icon": "❓",
            "title": "Scadenza indeterminata per natura dell'ordine",
            "desc": "Ordine aperto, commessa quadro o fornitura a chiamata",
            "next": "action_nd_indet"
          }
        ]
      },
      "action_nd_att": {
        "type": "action",
        "scenario": "nodata",
        "variant": "att"
      },
      "action_nd_dim": {
        "type": "action",
        "scenario": "nodata",
        "variant": "dim"
      },
      "action_nd_indet": {
        "type": "action",
        "scenario": "nodata",
        "variant": "indet"
      }
    }
  },
  "anzianita": {
    "label": "📦 Commessa anziana (>90 gg)",
    "steps": {
      "start": {
        "n": 1,
        "total": 2,
        "question": "Qual è la situazione reale di questa commessa anziana?",
        "desc": "Una commessa aperta da oltre 90 giorni richiede una revisione dello stato reale prima di decidere l'azione.",
        "opts": [
          {
            "id": "wip",
            "icon": "🔄",
            "title": "In lavorazione ma con avanzamento lento",
            "desc": "C'è attività ma il progresso è insufficiente rispetto al tempo trascorso",
            "next": "action_anz_wip"
          },
          {
            "id": "blk",
            "icon": "🚧",
            "title": "Ferma per una o più condizioni bloccanti",
            "desc": "Non si riesce ad avanzare per motivi specifici già identificati",
            "next": "action_anz_blk"
          },
          {
            "id": "obs",
            "icon": "🗃",
            "title": "Potenzialmente obsoleta o annullata",
            "desc": "Il cliente non si è fatto vivo, o l'ordine potrebbe non essere più attuale",
            "next": "action_anz_obs"
          },
          {
            "id": "parz",
            "icon": "✅",
            "title": "Parzialmente consegnata, resta un residuo",
            "desc": "Gran parte è stata consegnata, rimane una piccola quota da completare",
            "next": "action_anz_parz"
          }
        ]
      },
      "action_anz_wip": {
        "type": "action",
        "scenario": "anzianita",
        "variant": "wip"
      },
      "action_anz_blk": {
        "type": "action",
        "scenario": "anzianita",
        "variant": "blk"
      },
      "action_anz_obs": {
        "type": "action",
        "scenario": "anzianita",
        "variant": "obs"
      },
      "action_anz_parz": {
        "type": "action",
        "scenario": "anzianita",
        "variant": "parz"
      }
    }
  },
  "concentrazione": {
    "label": "🏢 Concentrazione su cliente",
    "steps": {
      "start": {
        "n": 1,
        "total": 2,
        "question": "Qual è il livello di concentrazione?",
        "opts": [
          {
            "id": "alta",
            "icon": "🔴",
            "title": "> 50% portafoglio su un cliente",
            "desc": "Dipendenza estrema — qualsiasi problema del cliente si riflette direttamente sull'intera produzione",
            "next": "action_conc_alta"
          },
          {
            "id": "med",
            "icon": "🟠",
            "title": "30–50% su un cliente",
            "desc": "Concentrazione elevata — monitoraggio continuo necessario",
            "next": "action_conc_med"
          }
        ]
      },
      "action_conc_alta": {
        "type": "action",
        "scenario": "concentrazione",
        "variant": "alta"
      },
      "action_conc_med": {
        "type": "action",
        "scenario": "concentrazione",
        "variant": "med"
      }
    }
  },
  "area_overload": {
    "label": "🏭 Area di produzione sovraccarica",
    "steps": {
      "start": {
        "n": 1,
        "total": 2,
        "question": "Quale aspetto del sovraccarico è più critico?",
        "opts": [
          {
            "id": "vol",
            "icon": "📈",
            "title": "Troppi ordini aperti nello stesso reparto",
            "desc": "Il volume di commesse supera la capacità di lavorazione del reparto",
            "next": "action_area_vol"
          },
          {
            "id": "blk",
            "icon": "🚧",
            "title": "Molte commesse bloccate nel reparto",
            "desc": "Numerosi blocchi si concentrano su una singola area produttiva",
            "next": "action_area_blk"
          },
          {
            "id": "crit",
            "icon": "⏰",
            "title": "Commesse critiche in ritardo tutte nello stesso reparto",
            "desc": "Le commesse più urgenti sono tutte ferme nello stesso collo di bottiglia",
            "next": "action_area_crit"
          }
        ]
      },
      "action_area_vol": {
        "type": "action",
        "scenario": "area_overload",
        "variant": "vol"
      },
      "action_area_blk": {
        "type": "action",
        "scenario": "area_overload",
        "variant": "blk"
      },
      "action_area_crit": {
        "type": "action",
        "scenario": "area_overload",
        "variant": "crit"
      }
    }
  }
};

export const ACTIONS: Record<string, GuidaPlan> = {
  "ritardo:mat": {
    "icon": "📦",
    "title": "Piano di recupero: Materiale mancante",
    "severity": "Alta",
    "sev_color": "var(--orange)",
    "warning": "Ogni giorno senza materiale aumenta il ritardo finale. Agire entro 24h dal rilevamento del blocco.",
    "tip": "Registra subito questo blocco come \"Condizione bloccante → Materiale\" nel sistema per tenere traccia della data di apertura.",
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Contatta il fornitore per status aggiornato",
        "detail": "Email + telefonata. Richiedi conferma data di spedizione scritta."
      },
      {
        "when": "Entro 24h",
        "what": "Valuta fornitori alternativi o magazzino interno",
        "detail": "Verifica se un componente similare può sostituire temporaneamente."
      },
      {
        "when": "Entro 48h",
        "what": "Comunica al cliente la situazione e la nuova stima",
        "detail": "Mai lasciare il cliente all'oscuro. Una comunicazione proattiva riduce il danno."
      },
      {
        "when": "Entro 72h",
        "what": "Attiva ordine d'urgenza se necessario",
        "detail": "Valuta costo extra trasporto espresso vs impatto del ritardo."
      }
    ],
    "checks_immediate": [
      "Contattato il fornitore per status spedizione",
      "Verificata disponibilità in altri magazzini interni",
      "Verificata disponibilità su fornitori alternativi",
      "Valutato costo trasporto espresso"
    ],
    "checks_followup": [
      "Comunicato al cliente il ritardo con nuova data stimata",
      "Registrato blocco nel sistema con data scadenza attesa",
      "Aggiornata la scadenza interna della commessa",
      "Assegnato owner responsabile del follow-up fornitore"
    ],
    "escalation": "Se il materiale non arriva entro 5 giorni lavorativi dalla data promessa dal fornitore, escalare al responsabile acquisti per valutare penali contrattuali o cambio fornitore urgente."
  },
  "ritardo:cap": {
    "icon": "🏭",
    "title": "Piano di recupero: Capacità produttiva",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "tip": "Il problema di capacità spesso si risolve con una corretta repriorizzazione — non sempre serve straordinario o esternalizzazione.",
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Mappa le commesse in lavorazione nel reparto",
        "detail": "Quante commesse sono attive? Quali possono slittare senza impatto critico?"
      },
      {
        "when": "Entro 24h",
        "what": "Repriorizza il backlog del reparto",
        "detail": "Metti la commessa in ritardo in cima alla coda. Usa la matrice urgenza/importanza."
      },
      {
        "when": "Entro 48h",
        "what": "Valuta spostamento temporaneo su altro reparto o turno extra",
        "detail": "Esternalizzazione parziale se l'area è strutturalmente satura."
      },
      {
        "when": "Entro 1 settimana",
        "what": "Analizza causa radice del sovraffollamento",
        "detail": "Troppi ordini accettati? Pianificazione errata? Bassa efficienza?"
      }
    ],
    "checks_immediate": [
      "Censiti tutti gli ordini attivi nel reparto",
      "Identificate commesse non urgenti da posticipare",
      "Commessa prioritizzata in cima al backlog del reparto",
      "Comunicata la repriorizzazione al responsabile di reparto"
    ],
    "checks_followup": [
      "Verificata ogni giorno l'avanzamento della commessa",
      "Valutata esternalizzazione parziale se necessario",
      "Aggiornata la data stimata di completamento",
      "Comunicato aggiornamento al cliente"
    ],
    "escalation": "Se il reparto è strutturalmente saturo e non si riesce a liberare slot entro 5 giorni, escalare al responsabile di produzione per valutare assunzione temporanea o revisione del portafoglio ordini."
  },
  "ritardo:tec": {
    "icon": "⚙",
    "title": "Piano di recupero: Problema tecnico / Rilavorazione",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "warning": "Le rilavorazioni non pianificate hanno costi nascosti (materiale, tempo, reputazione). Documenta sempre la causa per prevenire ricorrenze.",
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Ferma il processo e isola i pezzi non conformi",
        "detail": "Evita che pezzi difettosi avanzino nella produzione — aumentano i costi."
      },
      {
        "when": "Entro 24h",
        "what": "Analisi causa radice (RCA)",
        "detail": "Perché è successo? Errore umano, specifica errata, strumento non calibrato?"
      },
      {
        "when": "Entro 48h",
        "what": "Definisci piano di rilavorazione con tempi certi",
        "detail": "Quanti pezzi? Quanto tempo? Chi lo fa? Quando si riparte?"
      },
      {
        "when": "Entro 72h",
        "what": "Comunica al cliente con nuova data e spiegazione",
        "detail": "Sii trasparente ma professionale. Proponi misure correttive."
      }
    ],
    "checks_immediate": [
      "Pezzi non conformi isolati e contrassegnati",
      "Causa radice identificata e documentata",
      "Valutata possibilità di recupero vs scarto",
      "Definito piano di rilavorazione con tempi"
    ],
    "checks_followup": [
      "Avviata azione correttiva per prevenire ricorrenza",
      "Aggiornato il piano di produzione con i tempi di recupero",
      "Comunicato al cliente con nuova data stimata",
      "Verificata disponibilità di materiale aggiuntivo se necessario"
    ],
    "escalation": "Se la non conformità riguarda un requisito di sicurezza o normativo, coinvolgere immediatamente il responsabile Qualità e valutare notifica al cliente prima di qualsiasi rilavorazione."
  },
  "ritardo:cli": {
    "icon": "👤",
    "title": "Piano di recupero: Attesa cliente",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "tip": "Documenta ogni tentativo di contatto con data e ora. In caso di contestazione futura, dimostra che il ritardo non è imputabile alla tua azienda.",
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Invia sollecito formale via email con data di scadenza risposta",
        "detail": "Specifica che senza risposta entro X giorni la commessa verrà messa in pausa."
      },
      {
        "when": "Entro 48h",
        "what": "Contatto telefonico diretto con referente cliente",
        "detail": "Scala al contatto più senior se il referente abituale non risponde."
      },
      {
        "when": "Entro 1 settimana",
        "what": "Secondo sollecito formale con avviso di impatto",
        "detail": "Comunica formalmente che il ritardo del cliente sta impattando la consegna."
      },
      {
        "when": "Oltre 10 gg",
        "what": "Escalation interna e valutazione legale/contrattuale",
        "detail": "Verifica le clausole contrattuali su responsabilità per ritardo del cliente."
      }
    ],
    "checks_immediate": [
      "Inviato sollecito email con data scadenza risposta",
      "Tentato contatto telefonico",
      "Documentata data e ora di ogni tentativo di contatto",
      "Registrato blocco nel sistema come \"Attesa cliente\""
    ],
    "checks_followup": [
      "Inviato secondo sollecito formale",
      "Coinvolto referente senior del cliente",
      "Valutato impatto sulla data di consegna finale",
      "Informato il responsabile commerciale interno"
    ],
    "escalation": "Dopo 15 giorni senza risposta, coinvolgere il responsabile commerciale per valutare la situazione contrattuale e decidere se mettere formalmente in pausa la commessa."
  },
  "ritardo:pla": {
    "icon": "📋",
    "title": "Piano di recupero: Errore di pianificazione",
    "severity": "Bassa",
    "sev_color": "var(--green)",
    "tip": "Questo tipo di ritardo è il più facilmente prevenibile. Una volta risolto, analizza il processo di pianificazione per evitare recidive.",
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Assegna subito un owner alla commessa",
        "detail": "Commesse senza responsabile tendono a essere trascurate. Chi è il referente?"
      },
      {
        "when": "Entro 24h",
        "what": "Definisci una scadenza interna realistica",
        "detail": "Analizza i passi rimanenti, stima i tempi, fissa una data target interna."
      },
      {
        "when": "Entro 48h",
        "what": "Inserisci la commessa nel piano settimanale",
        "detail": "Assegna le risorse necessarie e blocca il tempo in agenda."
      },
      {
        "when": "Fine settimana",
        "what": "Verifica avanzamento e aggiorna il cliente",
        "detail": "Comunica proattivamente la nuova data di consegna prevista."
      }
    ],
    "checks_immediate": [
      "Owner assegnato alla commessa nel sistema",
      "Priorità aggiornata (almeno \"Alta\")",
      "Scadenza interna definita e registrata",
      "Commessa inserita nel piano settimanale del reparto"
    ],
    "checks_followup": [
      "Cliente informato sulla nuova data stimata",
      "Verificato avanzamento dopo 3 giorni",
      "Analizzata causa della mancata pianificazione",
      "Introdotta misura preventiva (es. checklist settimanale)"
    ],
    "escalation": "Se la commessa non avanza nonostante l'assegnazione, verificare se ci sono blocchi tecnici o operativi non dichiarati che impediscono il lavoro."
  },
  "bloccante:mat_urg": {
    "icon": "📦🔴",
    "title": "URGENTE — Materiale mancante, consegna imminente",
    "severity": "Critica",
    "sev_color": "var(--red)",
    "warning": "Hai meno di 15 giorni. Ogni ora conta. Bypassa i processi ordinari di approvazione se necessario e ottieni l'autorizzazione a procedere.",
    "timeline": [
      {
        "when": "Entro 2 ore",
        "what": "Contatto diretto con il fornitore — direzione / commerciale",
        "detail": "Non bastano email. Telefono diretto al responsabile commerciale o alla direzione."
      },
      {
        "when": "Entro 4 ore",
        "what": "Cerca alternative immediate: altri fornitori, mercato spot",
        "detail": "Usa distributori, piattaforme di acquisto rapido, contatti di rete."
      },
      {
        "when": "Entro oggi",
        "what": "Autorizza spedizione express se materiale disponibile altrove",
        "detail": "Il costo del corriere espresso è quasi sempre minore del danno al cliente."
      },
      {
        "when": "Entro 24h",
        "what": "Comunica al cliente lo stato con piano concreto",
        "detail": "Il cliente deve sapere che stai gestendo attivamente la situazione."
      }
    ],
    "checks_immediate": [
      "Contattato il responsabile commerciale del fornitore direttamente",
      "Cercato materiale su fornitori alternativi (min. 3)",
      "Verificato disponibilità da rivenditori/distributori",
      "Autorizzato trasporto express se disponibile"
    ],
    "checks_followup": [
      "Comunicato al cliente con ETA aggiornato",
      "Confermato arrivo materiale via tracking",
      "Aggiornato sistema con nuova data di consegna",
      "Avviata analisi per prevenire ricorrenza (scorta minima?)"
    ],
    "escalation": "Se entro 24h non si riesce a trovare il materiale, escalare immediatamente al responsabile commerciale e al direttore per valutare comunicazione formale al cliente e possibili misure compensative."
  },
  "bloccante:mat_std": {
    "icon": "📦",
    "title": "Materiale mancante — Gestione standard",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "tip": "Con sufficiente anticipo, quasi sempre si riesce a recuperare senza impatto sul cliente. Agisci ora per non ritrovarti in situazione urgente.",
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Verifica status ordine e data di consegna confermata dal fornitore",
        "detail": "Hai una data scritta? È confermata o solo stimata?"
      },
      {
        "when": "Entro 48h",
        "what": "Contatta fornitore per conferma scritta della data",
        "detail": "Una conferma scritta ti protegge in caso di ritardo successivo."
      },
      {
        "when": "Entro 1 settimana",
        "what": "Monitora settimanalmente lo stato dell'ordine",
        "detail": "Non aspettare la data di consegna per scoprire che c'è un ritardo."
      },
      {
        "when": "10 gg prima della scadenza",
        "what": "Se non è arrivato, attiva piano alternativo",
        "detail": "A 10 giorni dalla scadenza, il rischio diventa urgente."
      }
    ],
    "checks_immediate": [
      "Verificata data di consegna confermata dal fornitore",
      "Impostato reminder per follow-up a metà percorso",
      "Identificato fornitore alternativo di backup",
      "Registrato blocco nel sistema con data scadenza attesa"
    ],
    "checks_followup": [
      "Follow-up settimanale con fornitore",
      "Comunicazione preventiva al cliente se rischio di slittamento",
      "Materiale arrivato e verificato alla ricezione",
      "Blocco chiuso nel sistema con data risoluzione"
    ],
    "escalation": "Se a 10 giorni dalla data di consegna il materiale non è ancora arrivato e non c'è conferma precisa dal fornitore, trattare come situazione urgente."
  },
  "bloccante:cli_soft": {
    "icon": "👤",
    "title": "Attesa cliente — Sollecito standard",
    "severity": "Bassa",
    "sev_color": "var(--green)",
    "tip": "Un sollecito ben strutturato ha molto più impatto di uno informale. Usa sempre un canale tracciabile (email) come riferimento principale.",
    "checks_immediate": [
      "Inviato sollecito email con oggetto chiaro e data richiesta risposta",
      "Specificato l'impatto sulla commessa in caso di mancata risposta",
      "Registrato il blocco nel sistema con data apertura",
      "Impostato reminder per follow-up tra 3 giorni lavorativi"
    ],
    "checks_followup": [
      "Follow-up telefonico se nessuna risposta in 3 gg",
      "Risposta ricevuta e documentata",
      "Commessa sbloccata e avanzamento ripreso",
      "Blocco chiuso nel sistema"
    ],
    "timeline": [
      {
        "when": "Oggi",
        "what": "Email di sollecito con richiesta risposta entro data precisa",
        "detail": "Es: \"Per poter procedere con la commessa X, necessito conferma entro venerdì 23/05\""
      },
      {
        "when": "+ 3 giorni",
        "what": "Follow-up telefonico se nessuna risposta",
        "detail": "Breve e cordiale: verificare se l'email è arrivata e ribadire l'urgenza."
      }
    ],
    "escalation": "Se dopo 5 giorni lavorativi non si riceve risposta, passare al protocollo sollecito formale."
  },
  "bloccante:cli_hard": {
    "icon": "👤⚠",
    "title": "Attesa cliente — Sollecito formale",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "warning": "A questo punto il ritardo del cliente sta già impattando la tua pianificazione. È necessario mettere il fatto a verbale in modo formale.",
    "checks_immediate": [
      "Inviata comunicazione formale via email (non solo verbale)",
      "Specificata la data di scadenza risposta con conseguenze in caso di mancata risposta",
      "Coinvolto il responsabile commerciale interno",
      "Documentato l'impatto del ritardo sulla data di consegna"
    ],
    "checks_followup": [
      "Risposta ricevuta entro i tempi richiesti",
      "Nuovo termine di consegna concordato e confermato per iscritto",
      "Commessa ripianificata nel sistema",
      "Cliente consapevole che il ritardo finale è addebitabile all'attesa di risposta"
    ],
    "timeline": [
      {
        "when": "Oggi",
        "what": "Email formale con riferimento alle comunicazioni precedenti",
        "detail": "Riassumi la storia: prima email, follow-up, e situazione attuale."
      },
      {
        "when": "Entro 24h",
        "what": "Contatto telefonico con senior del cliente",
        "detail": "Scala a un interlocutore con potere decisionale."
      },
      {
        "when": "+5 giorni",
        "what": "Se nessuna risposta: comunicazione con avviso di impatto formale",
        "detail": "Notifica scritta che la consegna è slittata per mancata risposta."
      }
    ],
    "escalation": "Se dopo 15 giorni il cliente non risponde, escalare al responsabile commerciale e valutare se attivare clausole contrattuali."
  },
  "bloccante:cli_escalation": {
    "icon": "👤🚨",
    "title": "ESCALATION — Cliente non risponde da oltre 15 gg",
    "severity": "Critica",
    "sev_color": "var(--red)",
    "warning": "Questa situazione richiede un intervento a livello direzionale. Non è più gestibile operativamente senza supporto commerciale e legale.",
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Escalation al responsabile commerciale e direzione",
        "detail": "Presenta la documentazione di tutti i tentativi di contatto."
      },
      {
        "when": "Entro 48h",
        "what": "Valutazione clausole contrattuali con l'ufficio legale",
        "detail": "Qual è la responsabilità del cliente per il ritardo? Esistono penali?"
      },
      {
        "when": "Entro 1 settimana",
        "what": "Decisione su messa in pausa o chiusura della commessa",
        "detail": "Tenere una commessa aperta senza prospettiva blocca risorse."
      }
    ],
    "checks_immediate": [
      "Tutta la documentazione dei tentativi di contatto raccolta",
      "Escalation al responsabile commerciale formalizzata",
      "Valutata la situazione contrattuale con supporto legale",
      "Decisione presa su messa in pausa / chiusura della commessa"
    ],
    "checks_followup": [
      "Stato della commessa aggiornato nel sistema",
      "Risorse liberate e riassegnate se commessa messa in pausa",
      "Cliente notificato formalmente della decisione presa"
    ],
    "escalation": "In assenza di risposta e con potenziale perdita economica, valutare l'emissione di una comunicazione formale legale entro 30 giorni dall'ultimo contatto."
  },
  "bloccante:for_silenzio": {
    "icon": "🏭📵",
    "title": "Fornitore esterno — Non risponde",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "warning": "Un fornitore silenzioso è spesso un fornitore in difficoltà. Non aspettare: cerca alternative in parallelo dal primo giorno.",
    "checks_immediate": [
      "Tentato contatto su tutti i canali (email, telefono, WhatsApp)",
      "Inviata comunicazione formale con richiesta risposta entro 24h",
      "Identificati almeno 2 fornitori alternativi per la stessa lavorazione",
      "Avviato preventivo di emergenza con fornitore alternativo"
    ],
    "checks_followup": [
      "Fornitore risposto e data di rientro confermata",
      "Oppure: commessa spostata su fornitore alternativo",
      "Valutazione se continuare rapporto con questo fornitore",
      "Aggiornato il registro fornitori con nota sull'affidabilità"
    ],
    "timeline": [
      {
        "when": "Giorno 1",
        "what": "Multi-canale: email + telefono + PEC se disponibile",
        "detail": "Documenta tutto. Se non risponde, hai la prova del tentativo."
      },
      {
        "when": "Giorno 2",
        "what": "Avvia preventivo urgente con fornitore alternativo",
        "detail": "Non aspettare la risposta per cercare alternative."
      },
      {
        "when": "Giorno 3",
        "what": "Se ancora silenzio: emetti ordine al fornitore alternativo",
        "detail": "Il costo di un eventuale doppio ordine è minore del ritardo."
      }
    ],
    "escalation": "Se il fornitore ha già ricevuto materiale della tua azienda e non risponde, coinvolgere l'ufficio legale per recupero beni o danni da inadempienza contrattuale."
  },
  "bloccante:for_ritardo": {
    "icon": "🏭⏳",
    "title": "Fornitore esterno — Ritardo confermato",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "tip": "Un ritardo comunicato è già mezzo problema risolto. Ora si tratta di gestire l'impatto e trovare soluzioni di compensazione.",
    "checks_immediate": [
      "Nuova data di rientro confermata per iscritto dal fornitore",
      "Calcolato l'impatto del ritardo sulla data di consegna finale",
      "Comunicato al cliente il nuovo timing con spiegazione",
      "Valutata possibilità di accelerare altre fasi produttive nel frattempo"
    ],
    "checks_followup": [
      "Monitoraggio settimanale con fornitore fino al rientro",
      "Merce rientrata e verificata alla ricezione",
      "Commessa ripresa e completata",
      "Aggiornata valutazione del fornitore"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Conferma scritta della nuova data dal fornitore",
        "detail": "Email con data precisa, non \"tra qualche giorno\"."
      },
      {
        "when": "Entro 24h",
        "what": "Comunicazione al cliente con impatto sulla consegna",
        "detail": "Proattivo e professionale: meglio avvisare prima che dopo."
      },
      {
        "when": "Ogni 3 giorni",
        "what": "Follow-up con fornitore per monitoraggio",
        "detail": "Non aspettare la data promessa per scoprire un nuovo ritardo."
      }
    ],
    "escalation": "Se il fornitore posticipa la data per la seconda volta, valutare contestazione formale e ricerca di alternativa strutturale."
  },
  "bloccante:for_nc": {
    "icon": "🏭❌",
    "title": "Fornitore esterno — Merce rientrata non conforme",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "warning": "Non accettare merce non conforme sotto pressione del tempo. Una rilavorazione su pezzo difettoso costa più di un rifiuto immediato.",
    "checks_immediate": [
      "Merce non conforme isolata e fotografata (prova documentale)",
      "Redatto rapporto di non conformità formale",
      "Comunicato al fornitore via email con allegata documentazione",
      "Richiesta rilavorazione urgente o sostituzione immediata"
    ],
    "checks_followup": [
      "Fornitore accettato la non conformità e proposto piano di rientro",
      "Merce rilavorata/sostituita rientrata e verificata",
      "Aggiornata la valutazione qualitativa del fornitore",
      "Considerata introduzione di controllo in ingresso per questo fornitore"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Documento NC inviato al fornitore con foto e specifiche",
        "detail": "Più è documentato, meno margine ha il fornitore per contestare."
      },
      {
        "when": "Entro 24h",
        "what": "Chiamata per allineamento e definizione piano di rientro",
        "detail": "Chi rilavorerà? In quali tempi? A che costo per il fornitore?"
      },
      {
        "when": "Entro 48h",
        "what": "Decisione: attendi rilavorazione o cerchi alternativa?",
        "detail": "Dipende dal tempo disponibile prima della scadenza."
      }
    ],
    "escalation": "Se il fornitore contesta la non conformità, fai valutare il pezzo da un tecnico indipendente e prepara la documentazione per un eventuale arbitrato o contestazione formale."
  },
  "bloccante:tec_nc": {
    "icon": "⚙❌",
    "title": "Non conformità interna in produzione",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "checks_immediate": [
      "Produzione ferma sul lotto non conforme",
      "Causa radice identificata (perché è successo?)",
      "Quantità non conformi isolate e contrassegnate",
      "Valutazione recuperabilità (rilavorabile vs scarto)"
    ],
    "checks_followup": [
      "Piano di rilavorazione definito con tempi certi",
      "Azione correttiva avviata per prevenire ricorrenza",
      "Cliente informato se impatta la data di consegna",
      "Documento NC archiviato per il sistema qualità"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Isola il lotto e fai analisi causa radice",
        "detail": "5 Perché o Ishikawa: trova la vera causa, non il sintomo."
      },
      {
        "when": "Entro 24h",
        "what": "Definisci piano di rilavorazione con risorse e tempi",
        "detail": "Quante ore? Chi? Quali attrezzature? Impatto su altri ordini?"
      },
      {
        "when": "Entro 48h",
        "what": "Avvia azione correttiva documentata",
        "detail": "Per il sistema qualità e per prevenire che si ripeta."
      }
    ],
    "escalation": "Se la NC riguarda un requisito normativo o di sicurezza, bloccare la commessa e coinvolgere il responsabile qualità prima di qualsiasi altra azione."
  },
  "bloccante:tec_spec": {
    "icon": "📐",
    "title": "Specifica ambigua o in conflitto",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "tip": "Non procedere mai su interpretazione propria di una specifica ambigua. Il costo di una rilavorazione è sempre maggiore del costo di una chiarimento.",
    "checks_immediate": [
      "Produzione sospesa sul punto ambiguo",
      "Ambiguità documentata per iscritto con riferimento ai documenti",
      "Richiesta di chiarimento inviata al cliente o all'ufficio tecnico",
      "Specificata la data entro cui serve la risposta per non impattare la consegna"
    ],
    "checks_followup": [
      "Risposta ricevuta e interpretazione confermata per iscritto",
      "Disegno/specifica aggiornata con revisione documentata",
      "Produzione ripresa sulla base della specifica chiarita"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Ferma la produzione sul punto dubbio e documenta",
        "detail": "Non produrre su interpretazione propria."
      },
      {
        "when": "Entro 24h",
        "what": "Invia richiesta chiarimento con allegati (foto, disegno, specifiche)",
        "detail": "Più è chiara la domanda, più rapida è la risposta."
      },
      {
        "when": "Entro 48h",
        "what": "Follow-up se nessuna risposta",
        "detail": "L'urgenza dipende dalla scadenza della commessa."
      }
    ],
    "escalation": "Se il cliente o l'ufficio tecnico non risponde entro 5 giorni su una specifica critica per la produzione, scalare al responsabile tecnico/commerciale per sbloccare."
  },
  "bloccante:tec_modifica": {
    "icon": "🔧",
    "title": "Modifica tecnica in corso d'opera",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "warning": "Una modifica tecnica in corso d'opera è quasi sempre causa di extra-costi e ritardi. Documentala accuratamente per gestire eventuali contestazioni economiche.",
    "checks_immediate": [
      "Modifica ricevuta per iscritto dal cliente (non solo verbale)",
      "Valutato l'impatto tecnico sulla lavorazione in corso",
      "Valutato l'impatto sui tempi e sui costi",
      "Inviata proposta di revisione tempistiche e/o costi al cliente"
    ],
    "checks_followup": [
      "Cliente ha accettato la revisione di tempi/costi",
      "Ordine di modifica (change order) firmato o confermato per iscritto",
      "Piano di produzione aggiornato con i nuovi tempi",
      "Produzione ripresa sulla base della specifica modificata"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Ottieni la modifica per iscritto e valuta l'impatto",
        "detail": "Nessuna modifica senza conferma scritta."
      },
      {
        "when": "Entro 24h",
        "what": "Invia proposta di revisione tempistiche e costi",
        "detail": "La modifica ha un costo: documentalo e fallo approvare prima di procedere."
      },
      {
        "when": "Entro 48h",
        "what": "Ottieni accettazione scritta e aggiorna il piano",
        "detail": "Solo a questo punto si riavvia la produzione sulla nuova specifica."
      }
    ],
    "escalation": "Se il cliente chiede la modifica verbalmente senza volerla formalizzare, non procedere e scalare al responsabile commerciale per gestire la situazione contrattualmente."
  },
  "bloccante:doc": {
    "icon": "📄",
    "title": "Documento o certificazione mancante",
    "severity": "Bassa",
    "sev_color": "var(--green)",
    "tip": "I documenti mancanti a fine commessa sono spesso l'ultimo metro che divide dal completamento. Anticipa la raccolta durante la produzione.",
    "checks_immediate": [
      "Identificati esattamente i documenti mancanti",
      "Verificato chi è responsabile di produrli (interno vs cliente vs fornitore)",
      "Richiesta formale inviata al responsabile",
      "Impostato reminder con data scadenza"
    ],
    "checks_followup": [
      "Documenti ricevuti e verificati",
      "Archiviati nel fascicolo della commessa",
      "Commessa sbloccata e pronta per consegna/collaudo"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Mappa esatta di cosa manca e da chi dipende",
        "detail": "Non puoi chiedere se non sai esattamente cosa chiedere."
      },
      {
        "when": "Entro 24h",
        "what": "Richiesta formale con data scadenza chiara",
        "detail": "Es. \"Necessito del certificato X entro il 20/05 per procedere alla consegna\"."
      }
    ],
    "escalation": "Se la documentazione mancante è di natura normativa o legale e non arriva entro i tempi, non spedire il prodotto — le conseguenze legali superano il danno del ritardo."
  },
  "nodata:att": {
    "icon": "⏳",
    "title": "In attesa di conferma ordine",
    "severity": "Bassa",
    "sev_color": "var(--text2)",
    "tip": "Un'offerta senza risposta non dovrebbe tenere impegnate risorse produttive. Tieni aperta la commessa ma non pianificare ancora.",
    "checks_immediate": [
      "Verificata la data dell'ultima comunicazione con il cliente",
      "Inviato sollecito commerciale per aggiornamento status",
      "Registrata la commessa come \"In attesa ODA\" nel sistema",
      "Assegnato un owner commerciale per il follow-up"
    ],
    "checks_followup": [
      "ODA ricevuto e data di consegna inserita nel sistema",
      "Oppure: commessa chiusa se cliente non intende procedere",
      "Pulizia del portafoglio: rimuovi offerte scadute da oltre 90 gg"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Sollecito commerciale con richiesta di status aggiornato",
        "detail": "Se non hanno ancora deciso, quando prevedono di farlo?"
      },
      {
        "when": "+2 settimane",
        "what": "Secondo sollecito se nessuna risposta",
        "detail": "Dopo 2 settimane senza risposta, valuta chiusura dell'offerta."
      },
      {
        "when": "+1 mese",
        "what": "Chiudi la commessa se nessuna conferma",
        "detail": "Tenere aperte offerte zombie inquina il portafoglio e le statistiche."
      }
    ],
    "escalation": "Se l'offerta è di importo significativo e non si riceve risposta entro 30 giorni, escalare al responsabile commerciale per un contatto diretto a livello direzionale."
  },
  "nodata:dim": {
    "icon": "🗃",
    "title": "Scadenza non pianificata — Commessa dimenticata",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "warning": "Una commessa senza data è invisibile nel sistema. Finché non ha una scadenza, non esiste nella pianificazione.",
    "checks_immediate": [
      "Verificato lo stato reale della commessa: è già in lavorazione?",
      "Contattato il cliente per verificare le aspettative di consegna",
      "Assegnata una data di conclusione realistica",
      "Assegnato un owner responsabile"
    ],
    "checks_followup": [
      "Data inserita nel sistema",
      "Commessa inserita nel piano settimanale del reparto",
      "Verificato avanzamento dopo 5 giorni"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Chiama il cliente per capire le sue aspettative",
        "detail": "Spesso scopri che il cliente la voleva \"ieri\" — o che non è urgente."
      },
      {
        "when": "Entro 24h",
        "what": "Inserisci data realistica e owner nel sistema",
        "detail": "Una commessa senza data e senza owner è destinata a rimanere ferma."
      },
      {
        "when": "Entro 48h",
        "what": "Inserisci nel piano di produzione della settimana",
        "detail": "Solo così diventa \"reale\" per il reparto."
      }
    ],
    "escalation": "Se la commessa è aperta da oltre 60 giorni senza data né avanzamento, valutare con il responsabile se è ancora valida o se va chiusa/cancellata."
  },
  "nodata:indet": {
    "icon": "♾",
    "title": "Ordine a chiamata / Fornitura indeterminata",
    "severity": "Bassa",
    "sev_color": "var(--green)",
    "tip": "Gli ordini aperti o a chiamata sono legittimi ma devono essere monitorati periodicamente. Anche senza scadenza fissa, serve un owner e una revisione periodica.",
    "checks_immediate": [
      "Classificata la commessa come \"Ordine aperto / A chiamata\" nel sistema",
      "Definita una data di revisione periodica (es. ogni mese)",
      "Assegnato un owner per il monitoraggio"
    ],
    "checks_followup": [
      "Revisione mensile effettuata",
      "Verificato se il cliente ha nuove esigenze di spedizione",
      "Commessa chiusa quando completata o scaduta"
    ],
    "timeline": [
      {
        "when": "Oggi",
        "what": "Etichetta la commessa come ordine aperto",
        "detail": "Così non appare nelle statistiche di \"commesse dimenticate\"."
      },
      {
        "when": "Ogni mese",
        "what": "Revisione con il cliente: ci sono spedizioni da pianificare?",
        "detail": "Un cliente con ordine aperto è un cliente da coltivare."
      }
    ],
    "escalation": "Se un ordine aperto non ha chiamate da oltre 6 mesi, contattare il cliente per verificare se è ancora attivo o da chiudere formalmente."
  },
  "anzianita:wip": {
    "icon": "🔄",
    "title": "Commessa anziana in lavorazione lenta",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "warning": "Una commessa che avanza lentamente da oltre 90 giorni spesso soffre di bassa priorità cronica. Serve una decisione esplicita sulla sua importanza.",
    "checks_immediate": [
      "Verificato lo stato reale in produzione (percentuale avanzamento)",
      "Identificato il collo di bottiglia specifico che rallenta",
      "Elevata la priorità della commessa nel sistema",
      "Assegnato owner con responsabilità esplicita di chiusura"
    ],
    "checks_followup": [
      "Check settimanale sull'avanzamento",
      "Comunicazione al cliente con aggiornamento e nuova data stimata",
      "Commessa completata entro il nuovo termine fissato"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Analisi stato avanzamento reale e identificazione blocco",
        "detail": "Cosa manca esattamente per chiudere questa commessa?"
      },
      {
        "when": "Entro 48h",
        "what": "Piano di completamento con passi e date",
        "detail": "Quanti passi mancano? Stima realistica di chiusura?"
      },
      {
        "when": "Fine settimana",
        "what": "Comunicazione proattiva al cliente",
        "detail": "Il cliente probabilmente si è già dimenticato dell'ordine — o se lo aspettava ieri."
      }
    ],
    "escalation": "Se non si riesce a identificare un piano di completamento credibile entro 5 giorni, escalare al responsabile di produzione per una revisione del portafoglio."
  },
  "anzianita:blk": {
    "icon": "🚧",
    "title": "Commessa anziana — ferma per blocchi multipli",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "warning": "Una commessa anziana con blocchi multipli è spesso vittima di bassa priorità sistematica. Serve una riunione di sblocco dedicata.",
    "checks_immediate": [
      "Elencati tutti i blocchi attivi sulla commessa",
      "Identificato quale blocco è il più urgente da risolvere",
      "Convocata riunione di sblocco con tutti i responsabili coinvolti",
      "Assegnato un piano di risoluzione per ogni blocco con data target"
    ],
    "checks_followup": [
      "Blocchi risolti uno a uno entro le date target",
      "Commessa ripresa e monitorata settimanalmente",
      "Cliente aggiornato sulla situazione"
    ],
    "timeline": [
      {
        "when": "Entro 24h",
        "what": "Riunione di sblocco con tutti i responsabili dei blocchi aperti",
        "detail": "Un'ora di riunione può sbloccare settimane di stallo."
      },
      {
        "when": "Entro 48h",
        "what": "Piano di risoluzione blocchi con date e owner",
        "detail": "Ogni blocco deve avere un responsabile e una data."
      },
      {
        "when": "Settimanale",
        "what": "Check di avanzamento fino alla chiusura di tutti i blocchi",
        "detail": "Non lasciare che i blocchi tornino a ristagnare."
      }
    ],
    "escalation": "Se i blocchi dipendono da decisioni di altri reparti o da terze parti che non rispondono, escalare al responsabile di produzione o al direttore per sblocco a livello manageriale."
  },
  "anzianita:obs": {
    "icon": "🗃",
    "title": "Commessa potenzialmente obsoleta",
    "severity": "Bassa",
    "sev_color": "var(--text2)",
    "tip": "Un portafoglio pulito è più facile da gestire di uno pieno di commesse \"zombie\". Non aver paura di chiudere ordini non più attuali.",
    "checks_immediate": [
      "Contattato il cliente per verificare se l'ordine è ancora valido",
      "Verificata la situazione contrattuale (ordine annullabile? penali?)",
      "Verificato se materiale è già stato acquistato o lavorazione avviata"
    ],
    "checks_followup": [
      "Ordine confermato ancora valido → ripianificato con nuova data",
      "Oppure: ordine annullato con accordo cliente → commessa chiusa",
      "Materiale acquistato gestito (reso, riutilizzo, storno)"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Contatta il cliente: \"La commessa X è ancora valida?\"",
        "detail": "La domanda diretta è sempre la più efficace."
      },
      {
        "when": "Entro 48h",
        "what": "Sulla base della risposta: ripianifica o chiudi",
        "detail": "Non lasciare la commessa in stato di limbo."
      }
    ],
    "escalation": "Se il cliente non risponde e la commessa ha già generato costi (materiale, lavorazioni), coinvolgere il responsabile commerciale per valutare come recuperare i costi."
  },
  "anzianita:parz": {
    "icon": "✅",
    "title": "Commessa anziana parzialmente consegnata",
    "severity": "Bassa",
    "sev_color": "var(--green)",
    "tip": "Il residuo di una commessa consegnata è spesso la parte più difficile da chiudere. Tende a restare ferma per mesi. Trattala come una mini-commessa separata.",
    "checks_immediate": [
      "Verificato esattamente cosa manca da consegnare (quantità, specifiche)",
      "Verificata la tempistica richiesta dal cliente per il residuo",
      "Assegnato un owner specifico per la chiusura del residuo",
      "Schedulata la produzione del residuo nella prossima settimana"
    ],
    "checks_followup": [
      "Residuo prodotto e consegnato",
      "Cliente ha confermato ricezione e chiusura",
      "Commessa chiusa nel sistema"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Chiama il cliente: \"Quando ti serve il residuo?\"",
        "detail": "Spesso scopri che non è urgente — o che lo aspettava da mesi."
      },
      {
        "when": "Entro 48h",
        "what": "Schedulato il residuo nel piano di produzione",
        "detail": "Date concrete, non \"appena possibile\"."
      }
    ],
    "escalation": "Se il residuo è di valore trascurabile e il cliente non lo reclama, valutare se annullarlo formalmente con accordo del cliente per chiudere la commessa."
  },
  "concentrazione:alta": {
    "icon": "🏢🔴",
    "title": "Concentrazione critica (>50%) su un cliente",
    "severity": "Critica",
    "sev_color": "var(--red)",
    "warning": "Oltre il 50% del portafoglio su un cliente significa che qualsiasi evento negativo lato cliente (cancellazioni, ritardi pagamenti, crisi aziendali) colpisce l'intera produzione. Questo è un rischio strategico, non solo operativo.",
    "checks_immediate": [
      "Mappata la percentuale esatta di dipendenza dal cliente",
      "Verificata la solidità finanziaria e contrattuale del cliente",
      "Avviata riflessione su diversificazione del portafoglio ordini",
      "Valutato piano di contingency in caso di riduzione ordini dal cliente"
    ],
    "checks_followup": [
      "Obiettivo di diversificazione definito (es. max 35% su un cliente)",
      "Azioni commerciali per acquisire nuovi clienti avviate",
      "Portafoglio monitorato mensilmente"
    ],
    "timeline": [
      {
        "when": "Subito",
        "what": "Riunione strategica con direzione e commerciale",
        "detail": "Questo è un tema direzionale, non solo operativo."
      },
      {
        "when": "Entro 1 mese",
        "what": "Definizione obiettivo di diversificazione e piano commerciale",
        "detail": "Es: acquisire almeno 3 nuovi clienti nei prossimi 6 mesi."
      },
      {
        "when": "Trimestrale",
        "what": "Monitoraggio KPI di concentrazione del portafoglio",
        "detail": "La concentrazione va misurata come KPI regolare."
      }
    ],
    "escalation": "Se il cliente principale mostra segnali di difficoltà (ritardi pagamenti, riduzioni ordini improvvise, silenzio commerciale), escalare immediatamente alla direzione per valutare scenari di rischio."
  },
  "concentrazione:med": {
    "icon": "🏢⚠",
    "title": "Concentrazione elevata (30-50%) su un cliente",
    "severity": "Media",
    "sev_color": "var(--orange)",
    "tip": "La concentrazione al 30-50% è gestibile ma richiede monitoraggio attivo. Agisci ora per evitare di scivolare verso la soglia critica.",
    "checks_immediate": [
      "Monitoraggio mensile della percentuale di concentrazione",
      "Verifica del piano commerciale per acquisizione nuovi clienti",
      "Analisi della solidità del cliente (pagamenti, stabilità ordini)"
    ],
    "checks_followup": [
      "Percentuale di concentrazione in calo trimestrale",
      "Almeno 1–2 nuovi clienti acquisiti nei prossimi 6 mesi"
    ],
    "timeline": [
      {
        "when": "Questo mese",
        "what": "Discussione commerciale su diversificazione clienti",
        "detail": "Definisci target di acquisizione nuovi clienti per il trimestre."
      },
      {
        "when": "Ogni mese",
        "what": "Monitoraggio KPI concentrazione portafoglio",
        "detail": "Tieni traccia della percentuale e delle variazioni."
      }
    ],
    "escalation": "Se la concentrazione supera il 50%, passare al protocollo di concentrazione critica."
  },
  "area_overload:vol": {
    "icon": "📈",
    "title": "Reparto sovraccarico — Volume eccessivo",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "warning": "Un reparto saturo non riesce a rispettare le scadenze di nessun ordine. Serve una riduzione del carico, non solo la prioritizzazione.",
    "checks_immediate": [
      "Mappati tutti gli ordini attivi nel reparto con le date di scadenza",
      "Identificati gli ordini non urgenti da posticipare ad altro reparto o periodo",
      "Valutata possibilità di turnover extra o esternalizzazione parziale",
      "Repriorizzato il backlog: quali ordini fanno primo?"
    ],
    "checks_followup": [
      "Carico ridotto a livello sostenibile (max 80% capacità)",
      "Clienti informati sugli ordini posticipati",
      "Piano a lungo termine per evitare la saturazione"
    ],
    "timeline": [
      {
        "when": "Entro oggi",
        "what": "Analisi del carico: quante ore di lavoro vs disponibilità?",
        "detail": "Senza questa analisi non puoi decidere cosa fare."
      },
      {
        "when": "Entro 24h",
        "what": "Riunione con responsabile reparto e pianificazione",
        "detail": "Riduci il carico: posticipa, esternalizza, o aumenta la capacità."
      },
      {
        "when": "Entro 1 settimana",
        "what": "Comunicazione proattiva ai clienti degli ordini a rischio",
        "detail": "Meglio avvisare subito che subire contestazioni dopo."
      }
    ],
    "escalation": "Se il sovraccarico è strutturale e non si riesce a smaltire con turni extra o esternalizzazioni puntuali, escalare alla direzione per valutare investimenti in capacità produttiva."
  },
  "area_overload:blk": {
    "icon": "🏭🚧",
    "title": "Reparto con molti blocchi concentrati",
    "severity": "Alta",
    "sev_color": "var(--red)",
    "tip": "Quando i blocchi si concentrano in un'area specifica, spesso c'è una causa comune. Trovare la radice comune è più efficace che risolvere ogni blocco singolarmente.",
    "checks_immediate": [
      "Elencati tutti i blocchi attivi nel reparto",
      "Ricercata una causa comune tra i blocchi (stesso fornitore? stesso problema tecnico?)",
      "Riunione di sblocco con tutti i responsabili dei blocchi",
      "Piano di risoluzione con priorità e date target"
    ],
    "checks_followup": [
      "Blocchi risolti con piano tracciato",
      "Causa radice comune identificata e affrontata",
      "Misure preventive implementate"
    ],
    "timeline": [
      {
        "when": "Entro 24h",
        "what": "Analisi dei blocchi: c'è una causa comune?",
        "detail": "Es: tutti in attesa dello stesso fornitore → risolvi il fornitore una volta sola."
      },
      {
        "when": "Entro 48h",
        "what": "Riunione di sblocco e piano di azione",
        "detail": "Un'ora di focus può sbloccare settimane di stallo."
      }
    ],
    "escalation": "Se la causa comune dei blocchi dipende da un fornitore critico o da un problema tecnico strutturale, escalare per una soluzione sistemica e non solo tattica."
  },
  "area_overload:crit": {
    "icon": "⏰🏭",
    "title": "Commesse critiche tutte concentrate in un reparto",
    "severity": "Critica",
    "sev_color": "var(--red)",
    "warning": "Questo è un collo di bottiglia critico. Tutte le commesse urgenti stanno aspettando lo stesso reparto. Ogni ora persa qui si moltiplica per il numero di ordini in coda.",
    "checks_immediate": [
      "Identificate le commesse critiche per scadenza (urgenza massima prima)",
      "Valutata esternalizzazione urgente delle lavorazioni più critiche",
      "Valutato straordinario/turno notturno per aumentare la capacità temporanea",
      "Clienti informati sui rischi di slittamento"
    ],
    "checks_followup": [
      "Commesse più urgenti completate e consegnate",
      "Carico normalizzato nel reparto",
      "Piano strutturale per evitare ricorrenza del bottleneck"
    ],
    "timeline": [
      {
        "when": "Entro 2 ore",
        "what": "Lista delle commesse critiche ordinata per urgenza assoluta",
        "detail": "Chi ha la scadenza più vicina? Quella va prima."
      },
      {
        "when": "Entro oggi",
        "what": "Autorizzazione a procedere con straordinari o esternalizzazione",
        "detail": "Serve una decisione manageriale rapida — il tempo è il fattore critico."
      },
      {
        "when": "Entro 24h",
        "what": "Comunicazione ai clienti a rischio slittamento",
        "detail": "Proattivo e con proposta concreta di nuova data."
      }
    ],
    "escalation": "Se il reparto è strutturalmente il collo di bottiglia dell'azienda e si satura regolarmente, proporre all'investimento in capacità produttiva è una priorità strategica."
  }
};
