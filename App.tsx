import { Spotlight } from "@/components/spotlight";
import { FloatingNav } from "@/components/floating-navbar";
import { HeroParallax } from "@/components/hero-parallax";
import {
  CardContainer,
  CardBody,
  CardItem,
} from "@/components/3d-card-hover-tilt-effect";
import {
  TextRevealCard,
  TextRevealCardTitle,
  TextRevealCardDescription,
} from "@/components/text-reveal-card";

const PAINTS = [
  { name: "Giallo Volt", hex: "#ffd400" },
  { name: "Arancio Ardente", hex: "#ff5a1f" },
  { name: "Verde Mantis", hex: "#7bd23a" },
  { name: "Rosso Corsa", hex: "#d8261c" },
  { name: "Grigio Nardo", hex: "#c9c6bd" },
];

const CONFIGS = ["Z Coupé", "Z Spyder", "Z Corsa"];

// Side profile of the car as an inline SVG, so the page needs no image files.
const carSvg = (hex: string, label: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="720" viewBox="0 0 900 720">
      <rect width="900" height="720" fill="#141412"/>
      <path d="M0 90h900M0 630h900" stroke="#232321" stroke-width="2"/>
      <g transform="translate(0 210)">
        <polygon points="30,198 70,176 250,142 430,92 520,90 700,138 840,160 872,186 872,208 30,208" fill="${hex}"/>
        <polygon points="262,142 436,98 514,97 668,138 520,140" fill="#0a0a09"/>
        <polygon points="540,150 700,150 716,172 560,172" fill="#0a0a09"/>
        <circle cx="220" cy="206" r="40" fill="#0a0a09"/><circle cx="700" cy="206" r="40" fill="#0a0a09"/>
        <circle cx="220" cy="206" r="28" fill="#2b2b28"/><circle cx="700" cy="206" r="28" fill="#2b2b28"/>
        <circle cx="220" cy="206" r="9" fill="${hex}"/><circle cx="700" cy="206" r="9" fill="${hex}"/>
      </g>
      <text x="40" y="675" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="36" fill="#efece4" letter-spacing="6">${label.toUpperCase()}</text>
    </svg>`
  );

const products = Array.from({ length: 15 }, (_, i) => {
  const paint = PAINTS[i % PAINTS.length];
  const cfg = CONFIGS[i % CONFIGS.length];
  return {
    title: `${cfg} · ${paint.name}`,
    link: "#gamma",
    thumbnail: carSvg(paint.hex, paint.name),
  };
});

const SPECS = [
  { n: "1.015", u: "CV", l: "Potenza a 9.250 giri/min" },
  { n: "2,4", u: "s", l: "0–100 km/h" },
  { n: "352", u: "km/h", l: "Velocità massima" },
  { n: "1.480", u: "kg", l: "A secco, 1,46 kg/CV" },
];

const RANGE = [
  { name: "Z Coupé", tag: "Strada", rows: ["6.498 cc · 1.015 CV", "720 Nm a 6.750 giri", "da € 389.000"], hex: "#ffd400" },
  { name: "Z Spyder", tag: "Aperta", rows: ["6.498 cc · 1.015 CV", "Tetto in carbonio, 14 s", "da € 421.000"], hex: "#ff5a1f" },
  { name: "Z Corsa", tag: "Pista", rows: ["6.498 cc · 1.080 CV", "480 kg di carico a 300 km/h", "da € 612.000"], hex: "#7bd23a" },
];

const Header = () => (
  <div className="relative mx-auto w-full max-w-7xl px-4 py-20 md:py-32">
    <p className="font-data text-xs text-[var(--volt)]">La gamma</p>
    <h2 className="font-display mt-4 text-6xl font-extrabold italic md:text-9xl">
      Tre versioni.
      <br />
      <span className="text-[var(--volt)]">Un solo V12.</span>
    </h2>
    <p className="mt-8 max-w-xl text-lg text-[var(--ash)]">
      Cambio a doppia frizione a sette marce, scocca in carbonio forgiato e cinque vernici a tre strati applicate a mano a Sant'Agata.
    </p>
  </div>
);

export default function App() {
  return (
    <div className="relative">
      <FloatingNav
        navItems={[
          { name: "Gamma", link: "#gamma" },
          { name: "Prestazioni", link: "#prestazioni" },
          { name: "Contatto", link: "#contatto" },
        ]}
      />

      <header id="top" className="relative flex min-h-[92vh] items-end overflow-hidden px-4 pb-24 pt-32 md:px-10">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#ffd400" />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="font-data text-xs text-[var(--volt)]">
            Nuova hypercar · V12 aspirato · Sant'Agata Bolognese
          </p>
          <h1 className="font-display mt-4 text-[clamp(84px,19vw,280px)] font-extrabold italic">
            Vortice
            <br />
            <span className="text-transparent [-webkit-text-stroke:2px_#efece4]">V12 </span>
            <span className="text-[var(--volt)]">Z</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-[var(--ash)]">
            Dodici cilindri a 9.250 giri, 1.015 CV e una scocca in fibra di carbonio forgiato. Costruita per fare una cosa sola, nel modo più diretto possibile.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#contatto" className="cut font-display cursor-pointer bg-[var(--volt)] px-9 py-4 text-lg font-bold tracking-widest text-black transition hover:bg-white">
              Richiedi un test drive
            </a>
            <a href="#gamma" className="font-display cursor-pointer px-9 py-4 text-lg font-bold tracking-widest shadow-[inset_0_0_0_2px_#efece4] transition hover:bg-[#efece4] hover:text-black">
              Scopri la gamma
            </a>
          </div>
        </div>
      </header>

      <section id="prestazioni" className="mx-auto grid max-w-7xl grid-cols-2 border-y border-[var(--steel)] md:grid-cols-4">
        {SPECS.map((s, i) => (
          <div key={s.l} className={`px-4 py-8 md:px-6 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""} ${i < 3 ? "md:border-r" : "md:border-r-0"} border-[var(--steel)]`}>
            <div className="font-display text-6xl font-extrabold tabular-nums md:text-8xl">
              {s.n}
              <small className="ml-1 text-[.36em] tracking-wider text-[var(--volt)]">{s.u}</small>
            </div>
            <div className="font-data mt-3 text-[11px] text-[var(--ash)]">{s.l}</div>
          </div>
        ))}
      </section>

      <div id="gamma">
        <HeroParallax products={products} header={<Header />} />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-px bg-[var(--steel)] md:grid-cols-3">
          {RANGE.map((m) => (
            <CardContainer key={m.name} containerClassName="bg-[var(--coal)] py-10" className="w-full">
              <CardBody className="h-auto w-full px-8">
                <CardItem translateZ={30} className="font-data text-xs text-[var(--volt)]">{m.tag}</CardItem>
                <CardItem translateZ={60} as="h3" className="font-display mt-3 text-6xl font-extrabold">{m.name}</CardItem>
                <CardItem translateZ={80} className="mt-6 w-full">
                  <img src={carSvg(m.hex, m.name)} alt={`Profilo della ${m.name}`} className="w-full" />
                </CardItem>
                <CardItem translateZ={40} className="font-data mt-6 !normal-case !tracking-normal text-[13px] leading-8 text-[var(--ash)]">
                  {m.rows.map((r) => <div key={r}>{r}</div>)}
                </CardItem>
                <CardItem translateZ={50} as="a" href="#contatto" className="font-display mt-6 inline-block cursor-pointer text-base font-bold tracking-[.16em] text-[var(--volt)]">
                  Configura →
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </section>

      <section className="flex justify-center px-4 py-24">
        <TextRevealCard
          text="1.015 CV a 9.250 giri"
          revealText="2,4 s da 0 a 100 km/h"
          className="w-full max-w-3xl !bg-[var(--coal)]"
        >
          <TextRevealCardTitle>Passa il mouse sulla riga</TextRevealCardTitle>
          <TextRevealCardDescription>Dalla potenza al cronometro, in un solo gesto.</TextRevealCardDescription>
        </TextRevealCard>
      </section>

      <section id="contatto" className="mx-auto max-w-7xl px-4 pb-16 pt-12">
        <p className="font-data text-xs text-[var(--volt)]">Consegne da primavera 2027</p>
        <h2 className="font-display mt-4 text-[clamp(60px,13vw,200px)] font-extrabold italic">
          Il tuo
          <br />
          posto è <span className="text-[var(--volt)]">in pista</span>
        </h2>
        <a href="#top" className="cut font-display mt-9 inline-block cursor-pointer bg-[var(--volt)] px-9 py-4 text-lg font-bold tracking-widest text-black transition hover:bg-white">
          Richiedi un test drive
        </a>
      </section>

      <footer className="font-data mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-[var(--steel)] px-4 py-6 text-[11px] text-[var(--ash)]">
        <span>Aurelio Automobili · Vortice V12 Z</span>
        <span>Pagina di prova · marchio fittizio</span>
      </footer>
    </div>
  );
}
