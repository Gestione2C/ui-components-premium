"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconBallFootball,
  IconCalendarEvent,
  IconChartBar,
  IconCrown,
  IconFlame,
  IconGavel,
  IconHome,
  IconMessages,
  IconShield,
  IconSwitchHorizontal,
  IconTrendingDown,
  IconTrendingUp,
  IconTrophy,
  IconUsers,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import { StickyBanner } from "@/components/sticky-banner";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "@/components/resizable-navbar";
import { Spotlight } from "@/components/spotlight-new";
import { BackgroundBeams } from "@/components/background-beams";
import { SparklesCore } from "@/components/sparkles";
import { TextGenerateEffect } from "@/components/text-generate-effect";
import { FlipWords } from "@/components/flip-words";
import { ContainerTextFlip } from "@/components/container-text-flip";
import { HoverBorderGradient } from "@/components/hover-border-gradient";
import { MagneticButton } from "@/components/magnetic-button";
import { PointerHighlight } from "@/components/pointer-highlight";
import { TextFlippingBoard } from "@/components/text-flipping-board";
import { CardBody, CardContainer, CardItem } from "@/components/3d-card-hover-tilt-effect";
import { GlareCard } from "@/components/glare-card";
import { Tabs } from "@/components/tabs";
import { AnimatedTooltip } from "@/components/animated-tooltip";
import { BentoGrid, BentoGridItem } from "@/components/bento-grid";
import { CardSpotlight } from "@/components/card-spotlight";
import { Timeline } from "@/components/timeline";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useModal,
} from "@/components/animated-modal";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Button as StatefulButton } from "@/components/stateful-button";
import { Button as MovingBorderButton } from "@/components/moving-border";
import { PlaceholdersAndVanishInput } from "@/components/placeholders-and-vanish-input";
import { FloatingDock } from "@/components/floating-dock";
import { Meteors } from "@/components/meteors";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Dati di esempio                                                           */
/* -------------------------------------------------------------------------- */

const PRIZE_POOL = 1000;
const PRIZES = [
  { pos: "1°", label: "Campione", pct: 60, color: "#FBBF24" },
  { pos: "2°", label: "Vice", pct: 25, color: "#CBD5E1" },
  { pos: "3°", label: "Podio", pct: 15, color: "#F59E0B" },
];

const NAV_ITEMS = [
  { name: "Montepremi", link: "#montepremi" },
  { name: "Classifica", link: "#classifica" },
  { name: "Formazione", link: "#formazione" },
  { name: "Regole", link: "#regole" },
  { name: "Calendario", link: "#calendario" },
];

const TEAMS = [
  { name: "Real Onit", manager: "Marco R.", pts: 412.5, last: 78.5, trend: "up" },
  { name: "Atletico Pigiama", manager: "Giulia S.", pts: 404, last: 71, trend: "up" },
  { name: "Dinamo Kebab", manager: "Luca B.", pts: 397.5, last: 64.5, trend: "down" },
  { name: "Sporting Aperitivo", manager: "Chiara D.", pts: 389, last: 69, trend: "up" },
  { name: "FC Panchina d'Oro", manager: "Andrea F.", pts: 381.5, last: 58, trend: "down" },
  { name: "Borussia Dormund", manager: "Sara M.", pts: 376, last: 66.5, trend: "up" },
  { name: "AS Romagna Mia", manager: "Paolo T.", pts: 362.5, last: 60, trend: "down" },
  { name: "Inter Nos", manager: "Elena V.", pts: 355, last: 62, trend: "up" },
  { name: "Olimpia Fantasma", manager: "Davide C.", pts: 341, last: 55.5, trend: "down" },
  { name: "Juventus Bar Sport", manager: "Federica L.", pts: 329.5, last: 52, trend: "down" },
];

const SCORERS = [
  { name: "Lautaro M.", team: "Real Onit", goals: 14 },
  { name: "Osimhen V.", team: "Atletico Pigiama", goals: 12 },
  { name: "Thuram M.", team: "Dinamo Kebab", goals: 11 },
  { name: "Retegui M.", team: "Sporting Aperitivo", goals: 10 },
  { name: "Lookman A.", team: "Borussia Dormund", goals: 9 },
  { name: "Vlahovic D.", team: "Inter Nos", goals: 8 },
];

const avatar = (name: string, hue: number) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},80%,55%)'/><stop offset='1' stop-color='hsl(${hue + 50},80%,35%)'/></linearGradient></defs><rect width='120' height='120' fill='url(#g)'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='700' font-size='46' fill='white'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const MANAGERS = TEAMS.slice(0, 6).map((t, i) => ({
  id: i + 1,
  name: t.manager,
  designation: `${t.name} · ${t.pts} pt`,
  image: avatar(t.manager, 260 + i * 25),
}));

type Role = "POR" | "DIF" | "CEN" | "ATT";
type Player = { id: string; name: string; role: Role; team: string; fv: number };

const ROLE_STYLE: Record<Role, { label: string; color: string }> = {
  POR: { label: "Portiere", color: "#FBBF24" },
  DIF: { label: "Difensore", color: "#38BDF8" },
  CEN: { label: "Centrocampista", color: "#22C55E" },
  ATT: { label: "Attaccante", color: "#F43F5E" },
};

const PLAYERS: Player[] = [
  { id: "p1", name: "Sommer", role: "POR", team: "Inter", fv: 6.5 },
  { id: "p2", name: "Di Gregorio", role: "POR", team: "Juventus", fv: 6 },
  { id: "p3", name: "Meret", role: "POR", team: "Napoli", fv: 7 },
  { id: "d1", name: "Bastoni", role: "DIF", team: "Inter", fv: 7 },
  { id: "d2", name: "Dimarco", role: "DIF", team: "Inter", fv: 8.5 },
  { id: "d3", name: "Bremer", role: "DIF", team: "Juventus", fv: 6.5 },
  { id: "d4", name: "Di Lorenzo", role: "DIF", team: "Napoli", fv: 7.5 },
  { id: "d5", name: "Theo H.", role: "DIF", team: "Milan", fv: 8 },
  { id: "d6", name: "Buongiorno", role: "DIF", team: "Napoli", fv: 6 },
  { id: "d7", name: "Kalulu", role: "DIF", team: "Juventus", fv: 6.5 },
  { id: "c1", name: "Barella", role: "CEN", team: "Inter", fv: 7.5 },
  { id: "c2", name: "McTominay", role: "CEN", team: "Napoli", fv: 8.5 },
  { id: "c3", name: "Pulisic", role: "CEN", team: "Milan", fv: 8 },
  { id: "c4", name: "Calhanoglu", role: "CEN", team: "Inter", fv: 7 },
  { id: "c5", name: "Koopmeiners", role: "CEN", team: "Juventus", fv: 6.5 },
  { id: "c6", name: "Pellegrini", role: "CEN", team: "Roma", fv: 7.5 },
  { id: "c7", name: "Reijnders", role: "CEN", team: "Milan", fv: 7 },
  { id: "a1", name: "Lautaro", role: "ATT", team: "Inter", fv: 9.5 },
  { id: "a2", name: "Osimhen", role: "ATT", team: "Galatasaray", fv: 9 },
  { id: "a3", name: "Thuram", role: "ATT", team: "Inter", fv: 8 },
  { id: "a4", name: "Retegui", role: "ATT", team: "Atalanta", fv: 8.5 },
  { id: "a5", name: "Lookman", role: "ATT", team: "Atalanta", fv: 7.5 },
  { id: "a6", name: "Vlahovic", role: "ATT", team: "Juventus", fv: 7 },
];

const MODULES: Record<string, [number, number, number]> = {
  "3-4-3": [3, 4, 3],
  "4-3-3": [4, 3, 3],
  "4-4-2": [4, 4, 2],
  "3-5-2": [3, 5, 2],
};

const TESTIMONIALS = [
  { quote: "Tre anni di lega e ancora urlo contro lo schermo ogni domenica alle 20:45. Il bello è questo.", name: "Marco R.", title: "Campione in carica" },
  { quote: "L'asta di OnitGroup è un evento: pizza, calcolatrice e amicizie a rischio. Perfetto.", name: "Giulia S.", title: "Presidente Atletico Pigiama" },
  { quote: "Con 1.000 € di montepremi nessuno si arrende prima dell'ultima giornata. Nemmeno io, ultimo.", name: "Paolo T.", title: "Lanterna rossa onoraria" },
  { quote: "Classifica live, formazione in due tap e le regole chiare. Finalmente niente discussioni su Whatsapp.", name: "Elena V.", title: "Ex scettica, ora fanatica" },
  { quote: "Il modulo giusto vale mezza giornata. Il mio 3-5-2 resta leggenda.", name: "Davide C.", title: "Allenatore a tempo perso" },
];

const CALENDAR = [
  { title: "Iscrizioni", text: "Quota d'ingresso e scelta del nome squadra. Posti limitati a 12 team.", icon: IconUsers },
  { title: "Asta live", text: "500 crediti per team, rilanci a tempo e tanta strategia da bar.", icon: IconGavel },
  { title: "Campionato", text: "Girone all'italiana con 38 giornate e bonus/malus ufficiali.", icon: IconBallFootball },
  { title: "Mercato di gennaio", text: "Riparazione: scambi liberi e svincolati a budget residuo.", icon: IconSwitchHorizontal },
  { title: "Finale e premiazione", text: "Si assegnano i 1.000 € del montepremi OnitGroup.", icon: IconTrophy },
];

/* -------------------------------------------------------------------------- */
/*  Utility                                                                   */
/* -------------------------------------------------------------------------- */

const fmtEuro = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: true }).format(n);

function useCountUp(target: number, ms = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function useCountdown(days: number) {
  const [end] = useState(() => Date.now() + days * 86400000 + 3 * 3600000);
  const [left, setLeft] = useState(end - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(id);
  }, [end]);
  const s = Math.floor(left / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const Section = ({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={cn("relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-20 md:py-28", className)}>
    <motion.div
      className="mb-12 max-w-2xl"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#A78BFA]">{eyebrow}</p>
      <h2 className="font-display text-3xl text-white md:text-5xl">{title}</h2>
    </motion.div>
    {children}
  </section>
);

/* -------------------------------------------------------------------------- */
/*  Modal iscrizione                                                          */
/* -------------------------------------------------------------------------- */

function JoinTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { setOpen } = useModal();
  return (
    <button type="button" onClick={() => setOpen(true)} className={cn("cursor-pointer", className)}>
      {children}
    </button>
  );
}

function JoinModal() {
  const { setOpen } = useModal();
  const [done, setDone] = useState(false);
  const [team, setTeam] = useState("");
  const [mail, setMail] = useState("");
  const valid = team.trim().length >= 3 && /\S+@\S+\.\S+/.test(mail);

  return (
    <ModalBody className="md:max-w-xl">
      <ModalContent>
        <h3 className="font-display mb-2 text-2xl text-white md:text-3xl">
          {done ? "Sei dentro! 🎉" : "Iscrivi la tua squadra"}
        </h3>
        {done ? (
          <p className="text-neutral-300">
            <strong className="text-white">{team}</strong> è registrata alla OnitGroup League. Ti scriviamo a{" "}
            <strong className="text-white">{mail}</strong> con la data dell&apos;asta.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team" className="text-neutral-200">Nome squadra</Label>
              <Input id="team" placeholder="es. Real Onit" value={team} onChange={(e) => setTeam(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail" className="text-neutral-200">Email</Label>
              <Input id="mail" type="email" placeholder="presidente@squadra.it" value={mail} onChange={(e) => setMail(e.target.value)} />
            </div>
            <p className="text-xs text-neutral-400">
              Quota di partecipazione: {fmtEuro(PRIZE_POOL / 12)} · Montepremi garantito {fmtEuro(PRIZE_POOL)}.
            </p>
          </div>
        )}
      </ModalContent>
      <ModalFooter className="gap-3 bg-neutral-900">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTimeout(() => setDone(false), 300);
          }}
          className="cursor-pointer rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800"
        >
          {done ? "Chiudi" : "Annulla"}
        </button>
        {!done && (
          <StatefulButton
            disabled={!valid}
            className={cn("bg-[#7C3AED] px-6 text-white ring-[#7C3AED]", !valid && "cursor-not-allowed opacity-50")}
            onClick={async () => {
              await new Promise((r) => setTimeout(r, 1200));
              setDone(true);
            }}
          >
            Conferma iscrizione
          </StatefulButton>
        )}
      </ModalFooter>
    </ModalBody>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

const Logo = () => (
  <a href="#top" className="relative z-20 mr-4 flex items-center gap-2 px-2 py-1">
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#F43F5E]">
      <IconBallFootball size={18} className="text-white" />
    </span>
    <span className="font-display text-base text-white">
      Onit<span className="text-[#A78BFA]">Group</span>
    </span>
  </a>
);

function Header() {
  const [open, setOpen] = useState(false);
  const { setOpen: openJoin } = useModal();
  return (
    <Navbar>
      <NavBody>
        <Logo />
        <NavItems items={NAV_ITEMS} />
        <NavbarButton as="button" variant="gradient" onClick={() => openJoin(true)} className="relative z-20 !bg-gradient-to-b !from-[#7C3AED] !to-[#5B21B6]">
          Iscriviti
        </NavbarButton>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <Logo />
          <MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
          {NAV_ITEMS.map((i) => (
            <a key={i.link} href={i.link} onClick={() => setOpen(false)} className="w-full text-neutral-200">
              {i.name}
            </a>
          ))}
          <NavbarButton
            as="button"
            variant="gradient"
            className="w-full"
            onClick={() => {
              setOpen(false);
              openJoin(true);
            }}
          >
            Iscriviti
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function CountdownBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-16 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center backdrop-blur">
      <div className="font-display text-2xl tabular-nums text-white md:text-3xl">{String(value).padStart(2, "0")}</div>
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

function Hero() {
  const prize = useCountUp(PRIZE_POOL);
  const cd = useCountdown(12);
  return (
    <div id="top" className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-20 text-center">
      <Spotlight
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(263, 90%, 70%, .16) 0, hsla(263, 90%, 50%, .05) 50%, hsla(263, 90%, 40%, 0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(263, 90%, 70%, .12) 0, hsla(263, 90%, 50%, .04) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(345, 90%, 60%, .1) 0, hsla(345, 90%, 50%, .03) 80%, transparent 100%)"
      />
      <BackgroundBeams className="opacity-60" />
      <SparklesCore
        id="hero-sparkles"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={60}
        particleColor="#C4B5FD"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative z-10 flex flex-col items-center">
        <ContainerTextFlip
          words={["Stagione 2026/27", "Asta live", "Mercato aperto", "Gloria eterna"]}
          className="!bg-white/5 !text-sm !text-violet-200"
          textClassName="!text-violet-200"
          interval={2600}
        />
        <h1 className="font-display mt-6 max-w-4xl text-4xl leading-tight text-white md:text-7xl">
          <TextGenerateEffect words="Il Fantacalcio di OnitGroup" className="[&_*]:!font-display [&>div>div]:!text-4xl [&>div>div]:!leading-tight md:[&>div>div]:!text-7xl" />
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300 md:text-xl">
          Costruisci la tua{" "}
          <FlipWords words={["squadra", "leggenda", "dinastia", "rivincita"]} className="!text-[#F43F5E] font-semibold" />
          e sfida gli amici per
        </p>
        <div className="mt-6">
          <PointerHighlight rectangleClassName="border-[#A78BFA]" pointerClassName="text-[#F43F5E]">
            <span className="font-display text-5xl text-white md:text-7xl tabular-nums">{fmtEuro(prize)}</span>
          </PointerHighlight>
        </div>
        <p className="mt-3 text-sm uppercase tracking-[0.25em] text-slate-400">di montepremi garantito</p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <JoinTrigger>
            <HoverBorderGradient
              as="span"
              containerClassName="rounded-full"
              className="flex items-center gap-2 bg-[#0F0F23] px-7 py-3 text-base font-semibold text-white"
            >
              <IconTrophy size={20} className="text-[#FBBF24]" /> Iscrivi la tua squadra
            </HoverBorderGradient>
          </JoinTrigger>
          <MagneticButton strength={0.4} maxDistance={20}>
            <a
              href="#formazione"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-7 py-3 text-base font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Prova la formazione
            </a>
          </MagneticButton>
        </div>

        <div className="mt-12">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">Iscrizioni chiudono tra</p>
          <div className="flex gap-3">
            <CountdownBox label="giorni" value={cd.d} />
            <CountdownBox label="ore" value={cd.h} />
            <CountdownBox label="min" value={cd.m} />
            <CountdownBox label="sec" value={cd.s} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Montepremi                                                                */
/* -------------------------------------------------------------------------- */

function Prizes() {
  const [teams, setTeams] = useState(12);
  return (
    <Section id="montepremi" eyebrow="Montepremi" title={<>Mille euro. <span className="text-[#F43F5E]">Una sola corona.</span></>}>
      <div className="mb-16">
        <TextFlippingBoard
          rows={["", "  ONITGROUP LEAGUE", "  MONTEPREMI 1000 EURO", "  3 PREMI  12 SQUADRE", "  IL RESTO E GLORIA"]}
          className="max-w-3xl"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PRIZES.map((p, i) => (
          <CardContainer key={p.pos} containerClassName="py-0" className="w-full">
            <CardBody className="relative h-auto w-full rounded-2xl border border-white/10 bg-[#1E1C35] p-6">
              <CardItem translateZ={50} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest" style={{ color: p.color }}>
                <IconCrown size={18} /> {p.label}
              </CardItem>
              <CardItem translateZ={90} className="font-display mt-4 text-6xl text-white">
                {p.pos}
              </CardItem>
              <CardItem translateZ={70} className="font-display mt-2 text-3xl" style={{ color: p.color }}>
                {fmtEuro((PRIZE_POOL * p.pct) / 100)}
              </CardItem>
              <CardItem translateZ={30} className="mt-2 text-sm text-slate-400">
                {p.pct}% del montepremi{i === 0 ? " + coppa virtuale" : ""}
              </CardItem>
            </CardBody>
          </CardContainer>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-white/10 bg-[#1E1C35]/80 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="font-display text-xl text-white">Quanto costa partecipare?</h3>
            <p className="mt-1 text-sm text-slate-400">Muovi lo slider: la quota si divide in base al numero di squadre iscritte.</p>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl text-[#A78BFA]" aria-live="polite">{fmtEuro(PRIZE_POOL / teams)}</div>
            <div className="text-xs uppercase tracking-widest text-slate-400">a squadra · {teams} team</div>
          </div>
        </div>
        <input
          type="range"
          min={8}
          max={20}
          value={teams}
          onChange={(e) => setTeams(Number(e.target.value))}
          aria-label="Numero di squadre"
          className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#27273B] accent-[#7C3AED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A78BFA]"
        />
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>8 squadre</span>
          <span>20 squadre</span>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Classifica                                                                */
/* -------------------------------------------------------------------------- */

function StandingsTable({ sortBy }: { sortBy: "pts" | "last" }) {
  const rows = useMemo(() => [...TEAMS].sort((a, b) => b[sortBy] - a[sortBy]), [sortBy]);
  const max = rows[0][sortBy];
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#1E1C35] p-3 md:p-5">
      {rows.map((t, i) => (
        <motion.div
          layout
          key={t.name}
          className="relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 hover:bg-white/5 md:gap-4"
        >
          <span
            className={cn(
              "font-display grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm",
              i === 0 ? "bg-[#FBBF24] text-black" : i < 3 ? "bg-[#7C3AED] text-white" : "bg-[#27273B] text-slate-300",
            )}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-white">{t.name}</div>
            <div className="truncate text-xs text-slate-400">{t.manager}</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#27273B]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#F43F5E]"
                initial={{ width: 0 }}
                animate={{ width: `${(t[sortBy] / max) * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
          <span className="shrink-0" aria-label={t.trend === "up" ? "in crescita" : "in calo"}>
            {t.trend === "up" ? <IconTrendingUp size={18} className="text-[#22C55E]" /> : <IconTrendingDown size={18} className="text-[#F43F5E]" />}
          </span>
          <span className="font-display w-16 shrink-0 text-right text-lg tabular-nums text-white">{t[sortBy]}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Standings() {
  const tabs = [
    { title: "Generale", value: "generale", content: <StandingsTable sortBy="pts" /> },
    { title: "Ultima giornata", value: "giornata", content: <StandingsTable sortBy="last" /> },
    {
      title: "Marcatori",
      value: "marcatori",
      content: (
        <div className="w-full rounded-2xl border border-white/10 bg-[#1E1C35] p-3 md:p-5">
          {SCORERS.map((s, i) => (
            <div key={s.name} className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-white/5">
              <span className="font-display w-6 text-slate-400">{i + 1}</span>
              <IconBallFootball size={20} className="text-[#22C55E]" />
              <div className="flex-1">
                <div className="font-semibold text-white">{s.name}</div>
                <div className="text-xs text-slate-400">{s.team}</div>
              </div>
              <span className="font-display text-xl text-white">{s.goals}</span>
              <span className="text-xs text-slate-500">gol</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Section id="classifica" eyebrow="Classifica live" title="Chi comanda la lega?">
      <div className="mb-10 flex flex-col gap-3">
        <p className="text-sm text-slate-400">I presidenti da battere (passa il mouse sugli avatar):</p>
        <div className="flex flex-row items-center">
          <AnimatedTooltip items={MANAGERS} />
        </div>
      </div>
      <div className="relative flex h-[44rem] flex-col items-start [perspective:1000px] md:h-[52rem]">
        <Tabs
          tabs={tabs}
          containerClassName="mb-2"
          activeTabClassName="!bg-[#7C3AED]/40"
          tabClassName="text-slate-200"
          contentClassName="mt-6"
        />
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Formazione interattiva                                                    */
/* -------------------------------------------------------------------------- */

type Slot = { key: string; role: Role };

function buildSlots(module: string): Slot[][] {
  const [d, c, a] = MODULES[module];
  const row = (role: Role, n: number): Slot[] => Array.from({ length: n }, (_, i) => ({ key: `${role}-${i}`, role }));
  return [row("ATT", a), row("CEN", c), row("DIF", d), row("POR", 1)];
}

function LineupBuilder() {
  const [module, setModule] = useState("4-3-3");
  const [lineup, setLineup] = useState<Record<string, string>>({});
  const [active, setActive] = useState<Slot | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const rows = useMemo(() => buildSlots(module), [module]);
  const slotKeys = useMemo(() => new Set(rows.flat().map((s) => s.key)), [rows]);
  const picked = Object.entries(lineup).filter(([k]) => slotKeys.has(k));
  const usedIds = new Set(picked.map(([, id]) => id));
  const total = picked.reduce((sum, [, id]) => sum + (PLAYERS.find((p) => p.id === id)?.fv ?? 0), 0);
  const complete = picked.length === 11;

  const changeModule = (m: string) => {
    setModule(m);
    setActive(null);
    setSubmitted(false);
  };

  const assign = (p: Player) => {
    if (!active) return;
    setLineup((l) => ({ ...l, [active.key]: p.id }));
    setActive(null);
    setSubmitted(false);
  };

  const clear = (key: string) => {
    setLineup((l) => {
      const n = { ...l };
      delete n[key];
      return n;
    });
    setSubmitted(false);
  };

  const autoFill = () => {
    const used = new Set<string>();
    const next: Record<string, string> = {};
    rows.flat().forEach((s) => {
      const best = PLAYERS.filter((p) => p.role === s.role && !used.has(p.id)).sort((a, b) => b.fv - a.fv)[0];
      if (best) {
        used.add(best.id);
        next[s.key] = best.id;
      }
    });
    setLineup(next);
    setActive(null);
    setSubmitted(false);
  };

  const candidates = active ? PLAYERS.filter((p) => p.role === active.role && !usedIds.has(p.id)) : [];

  return (
    <Section id="formazione" eyebrow="Provalo subito" title={<>Schiera la tua <span className="text-[#22C55E]">formazione</span></>}>
      <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Modulo">
        {Object.keys(MODULES).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => changeModule(m)}
            aria-pressed={module === m}
            className={cn(
              "font-display cursor-pointer rounded-full border px-5 py-2 text-sm transition",
              module === m ? "border-[#7C3AED] bg-[#7C3AED] text-white" : "border-white/15 text-slate-300 hover:bg-white/10",
            )}
          >
            {m}
          </button>
        ))}
        <button
          type="button"
          onClick={autoFill}
          className="ml-auto flex cursor-pointer items-center gap-2 rounded-full border border-[#F43F5E]/50 px-5 py-2 text-sm text-[#F43F5E] transition hover:bg-[#F43F5E]/10"
        >
          <IconFlame size={16} /> Schiera i migliori
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Campo */}
        <div className="relative overflow-hidden rounded-2xl border border-[#22C55E]/30 bg-gradient-to-b from-[#14532D] to-[#052E16] p-4 md:p-6">
          <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-white/20" />
          <div className="pointer-events-none absolute inset-x-4 top-1/2 h-0.5 bg-white/20" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20" />
          <div className="relative flex min-h-[30rem] flex-col justify-around gap-4 py-4">
            {rows.map((row, ri) => (
              <div key={ri} className="flex justify-around">
                {row.map((slot) => {
                  const p = PLAYERS.find((x) => x.id === lineup[slot.key]);
                  const isActive = active?.key === slot.key;
                  return (
                    <div key={slot.key} className="flex w-16 flex-col items-center gap-1 sm:w-20">
                      <button
                        type="button"
                        onClick={() => (p ? clear(slot.key) : setActive(slot))}
                        aria-label={p ? `Rimuovi ${p.name}` : `Scegli ${ROLE_STYLE[slot.role].label}`}
                        className={cn(
                          "font-display grid h-12 w-12 cursor-pointer place-items-center rounded-full border-2 text-sm transition hover:scale-110 sm:h-14 sm:w-14",
                          isActive && "ring-4 ring-white/60",
                        )}
                        style={{
                          borderColor: ROLE_STYLE[slot.role].color,
                          background: p ? ROLE_STYLE[slot.role].color : "rgba(0,0,0,.35)",
                          color: p ? "#0F0F23" : ROLE_STYLE[slot.role].color,
                        }}
                      >
                        {p ? p.fv : "+"}
                      </button>
                      <span className="w-full truncate text-center text-[11px] font-semibold text-white">
                        {p ? p.name : slot.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Pannello */}
        <div className="flex flex-col gap-4">
          <CardSpotlight className="min-h-72 border-white/10 !bg-[#1E1C35] p-5" color="#3B1D8A">
            <div className="relative z-20">
              <h3 className="font-display text-lg text-white">
                {active ? `Scegli ${ROLE_STYLE[active.role].label.toLowerCase()}` : "Seleziona un ruolo sul campo"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {active ? "Fantavoto previsto accanto al nome." : "Tocca un cerchio vuoto; tocca un giocatore schierato per rimuoverlo."}
              </p>
              <ul className="mt-4 grid max-h-64 gap-2 overflow-auto pr-1">
                <AnimatePresence>
                  {candidates.map((p) => (
                    <motion.li key={p.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <button
                        type="button"
                        onClick={() => assign(p)}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left transition hover:border-[#7C3AED] hover:bg-[#7C3AED]/20"
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROLE_STYLE[p.role].color }} />
                        <span className="flex-1 text-sm font-semibold text-white">{p.name}</span>
                        <span className="text-xs text-slate-400">{p.team}</span>
                        <span className="font-display text-sm text-[#FBBF24]">{p.fv}</span>
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </CardSpotlight>

          <div className="rounded-2xl border border-white/10 bg-[#1E1C35] p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-400">Fantavoto totale</div>
                <div className="font-display text-5xl tabular-nums text-white">{total.toFixed(1)}</div>
              </div>
              <div className="text-right text-sm text-slate-400">{picked.length}/11 schierati</div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#27273B]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E] transition-all" style={{ width: `${(picked.length / 11) * 100}%` }} />
            </div>
            <div className="mt-5 flex justify-center">
              <MovingBorderButton
                borderRadius="1rem"
                disabled={!complete}
                onClick={() => setSubmitted(true)}
                containerClassName={cn("h-12 w-full", !complete && "opacity-50")}
                className="cursor-pointer border-white/10 bg-[#0F0F23] text-white disabled:cursor-not-allowed"
                borderClassName="bg-[radial-gradient(#F43F5E_40%,transparent_60%)]"
              >
                {submitted ? (
                  <span className="flex items-center gap-2"><IconCheck size={18} className="text-[#22C55E]" /> Formazione inviata!</span>
                ) : complete ? (
                  "Conferma formazione"
                ) : (
                  `Mancano ${11 - picked.length} giocatori`
                )}
              </MovingBorderButton>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Regole (bento)                                                            */
/* -------------------------------------------------------------------------- */

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">{children}</span>
);

function Rules() {
  const header = (children: React.ReactNode, from: string, to: string) => (
    <div className="flex min-h-24 flex-1 flex-wrap content-center items-center justify-center gap-2 rounded-xl p-3" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {children}
    </div>
  );
  const items = [
    { title: "Asta a rilanci", description: "500 crediti, 25 giocatori in rosa, rilanci con timer di 20 secondi.", icon: <IconGavel className="h-4 w-4 text-[#A78BFA]" />, className: "md:col-span-2", header: header(<><Chip>500 crediti</Chip><Chip>25 slot</Chip><Chip>Timer 20s</Chip></>, "#2E1065", "#4C1D95") },
    { title: "Bonus & malus", description: "Gol +3, assist +1, rigore parato +3, ammonizione −0,5.", icon: <IconChartBar className="h-4 w-4 text-[#22C55E]" />, header: header(<><Chip>+3 gol</Chip><Chip>−0,5 giallo</Chip></>, "#052E16", "#14532D") },
    { title: "Mercato libero", description: "Scambi tra presidenti approvati da due voti su tre.", icon: <IconSwitchHorizontal className="h-4 w-4 text-[#38BDF8]" />, header: header(<><Chip>Scambi</Chip><Chip>Svincolati</Chip></>, "#082F49", "#0C4A6E") },
    { title: "Chat della lega", description: "Sfottò, minacce amichevoli e notifiche delle formazioni.", icon: <IconMessages className="h-4 w-4 text-[#F43F5E]" />, header: header(<><Chip>Notifiche</Chip><Chip>Sfottò</Chip></>, "#4C0519", "#881337") },
    { title: "Statistiche live", description: "Fantavoti, medie e rendimento di ogni giocatore aggiornati a fine partita.", icon: <IconTrendingUp className="h-4 w-4 text-[#22C55E]" />, className: "md:col-span-1", header: header(<><Chip>Medie</Chip><Chip>Trend</Chip></>, "#1E1B4B", "#312E81") },
    { title: "Fair play garantito", description: "Formazione bloccata 1h prima del primo match, controllo OnitGroup su ogni scambio e premio pagato entro 7 giorni.", icon: <IconShield className="h-4 w-4 text-[#FBBF24]" />, className: "md:col-span-3", header: header(<><Chip>Lock 1h prima</Chip><Chip>Premio entro 7 giorni</Chip><Chip>Arbitro OnitGroup</Chip></>, "#451A03", "#78350F") },
  ];
  return (
    <Section id="regole" eyebrow="Regolamento" title="Poche regole, tanto agonismo">
      <BentoGrid className="md:auto-rows-[16rem]">
        {items.map((it) => (
          <BentoGridItem key={it.title} {...it} className={cn("!border-white/10 !bg-[#1E1C35]", it.className)} />
        ))}
      </BentoGrid>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Calendario / testimonial / invito / footer                                */
/* -------------------------------------------------------------------------- */

function Calendar() {
  const data = CALENDAR.map((c) => ({
    title: c.title,
    content: (
      <div className="mb-10 flex items-start gap-3 text-slate-300">
        <c.icon size={22} className="mt-0.5 shrink-0 text-[#A78BFA]" />
        <p className="max-w-md text-sm md:text-base">{c.text}</p>
      </div>
    ),
  }));
  return (
    <section id="calendario" className="relative w-full scroll-mt-28 bg-[#0F0F23]">
      <div className="mx-auto max-w-6xl px-4 pt-20 md:pt-28">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#A78BFA]">Calendario</p>
        <h2 className="font-display text-3xl text-white md:text-5xl">Dall&apos;asta alla premiazione</h2>
      </div>
      <div className="[&_h2]:!text-white [&_h3]:!text-slate-200 [&_h3]:!font-display [&>div]:!bg-transparent [&_.text-black]:!text-white">
        <Timeline data={data} heading="Cinque tappe verso il titolo" description="Dall'iscrizione alla premiazione: ecco come si gioca la stagione." />
      </div>
    </section>
  );
}

function Invite() {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <section className="relative mx-auto w-full max-w-4xl overflow-hidden px-4 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1E1C35] px-6 py-14 text-center md:px-12">
        <Meteors number={14} />
        <div className="relative z-10">
          <IconUsers className="mx-auto mb-4 text-[#A78BFA]" size={32} />
          <h2 className="font-display text-2xl text-white md:text-4xl">Hai un codice invito?</h2>
          <p className="mx-auto mt-2 mb-8 max-w-md text-sm text-slate-400">
            Inseriscilo qui per prenotare il tuo posto. Prova con <code className="rounded bg-black/40 px-1.5 py-0.5 text-[#FBBF24]">ONIT2026</code>.
          </p>
          <PlaceholdersAndVanishInput
            placeholders={["Codice invito (es. ONIT2026)", "Te l'ha dato il presidente", "Un solo codice, un solo posto"]}
            onChange={(e) => setValue(e.target.value)}
            onSubmit={() => {
              const ok = value.trim().toUpperCase() === "ONIT2026";
              setMsg(ok ? { ok, text: "Codice valido: posto riservato nella OnitGroup League!" } : { ok, text: "Codice non valido. Riprova." });
            }}
          />
          <div className="mt-4 min-h-6 text-sm" aria-live="polite">
            {msg && (
              <span className={cn("inline-flex items-center gap-1.5", msg.ok ? "text-[#22C55E]" : "text-[#F43F5E]")}>
                {msg.ok ? <IconCheck size={16} /> : <IconX size={16} />} {msg.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="relative w-full overflow-hidden py-16">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#A78BFA]">Dicono di noi</p>
      <InfiniteMovingCards items={TESTIMONIALS} speed="slow" direction="left" />
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-24 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <h2 className="font-display text-3xl text-white md:text-5xl">Pronto a vincere {fmtEuro(PRIZE_POOL)}?</h2>
        <p className="mt-3 max-w-lg text-slate-400">Tanto basta un posto, un nome squadra e un po&apos; di faccia tosta.</p>
      </div>
      <GlareCard className="flex flex-col items-center justify-center gap-4 p-8 !bg-[#1E1C35]">
        <IconTrophy size={48} className="text-[#FBBF24]" />
        <div className="font-display text-xl text-white">OnitGroup League</div>
        <JoinTrigger className="rounded-full bg-[#F43F5E] px-6 py-2.5 text-sm font-semibold text-black transition hover:brightness-110">
          Iscriviti ora
        </JoinTrigger>
      </GlareCard>
    </section>
  );
}

function Footer() {
  const dock = [
    { title: "Home", icon: <IconHome className="h-full w-full text-neutral-300" />, href: "#top" },
    { title: "Montepremi", icon: <IconTrophy className="h-full w-full text-neutral-300" />, href: "#montepremi" },
    { title: "Classifica", icon: <IconChartBar className="h-full w-full text-neutral-300" />, href: "#classifica" },
    { title: "Formazione", icon: <IconBallFootball className="h-full w-full text-neutral-300" />, href: "#formazione" },
    { title: "Regole", icon: <IconShield className="h-full w-full text-neutral-300" />, href: "#regole" },
    { title: "Calendario", icon: <IconCalendarEvent className="h-full w-full text-neutral-300" />, href: "#calendario" },
  ];
  return (
    <footer className="relative border-t border-white/10 px-4 py-12 text-center">
      <div className="flex justify-center">
        <FloatingDock items={dock} />
      </div>
      <p className="mt-8 text-xs text-slate-500">
        © 2026 OnitGroup · Pagina dimostrativa: squadre, voti e premi sono dati di esempio.
      </p>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */

export default function App() {
  return (
    <Modal>
      <div className="min-h-screen bg-[#0F0F23] text-slate-200">
        <StickyBanner className="bg-gradient-to-r from-[#7C3AED] to-[#F43F5E]">
          <p className="pr-8 text-center text-sm font-semibold text-white">
            Iscrizioni aperte: montepremi da {fmtEuro(PRIZE_POOL)} firmato OnitGroup.{" "}
            <a href="#montepremi" className="underline underline-offset-2">Scopri i premi</a>
          </p>
        </StickyBanner>
        <Header />
        <main>
          <Hero />
          <Prizes />
          <Standings />
          <LineupBuilder />
          <Rules />
          <Calendar />
          <Testimonials />
          <Invite />
          <FinalCta />
        </main>
        <Footer />
        <JoinModal />
      </div>
    </Modal>
  );
}
