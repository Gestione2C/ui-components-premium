import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
import animate from "tailwindcss-animate";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./commesse.html",
    "./commesse/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{ts,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // token shadcn usati da components/analytics-bento.tsx (allineati al tema delle commesse)
        card: { DEFAULT: "#0e1424", foreground: "#e8edf7" },
        muted: { DEFAULT: "#1a2340", foreground: "#9aa8c4" },
        border: "#212b45",
        ring: "#22d3ee",
        // Analizzatore commesse (token definiti in commesse/commesse.css)
        cm: {
          bg: "var(--cm-bg)",
          surface: "var(--cm-surface)",
          surface2: "var(--cm-surface2)",
          surface3: "var(--cm-surface3)",
          line: "var(--cm-line)",
          line2: "var(--cm-line2)",
          ink: "var(--cm-ink)",
          muted: "var(--cm-muted)",
          faint: "var(--cm-faint)",
          accent: "var(--cm-accent)",
          ok: "var(--cm-ok)",
          bad: "var(--cm-bad)",
          warn: "var(--cm-warn)",
          orange: "var(--cm-orange)",
          info: "var(--cm-info)",
          pink: "var(--cm-pink)",
        },
      },
      fontFamily: {
        cmsans: ['"Fira Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        cmmono: ['"Fira Code"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 normal forwards",
        meteor: "meteor 5s linear infinite",
        aurora: "aurora 60s linear infinite",
        scroll: "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
        "meteor-effect": "meteor-effect 5s linear infinite",
        "cell-ripple": "cell-ripple var(--duration, 200ms) ease-out var(--delay, 0ms)",
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: 0, transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: 1, transform: "translate(-50%,-40%) scale(1)" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "rotate(215deg) translateX(-500px)", opacity: "0" },
        },
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        scroll: {
          to: { transform: "translate(calc(-50% - 0.5rem))" },
        },
        "meteor-effect": {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "rotate(215deg) translateX(-500px)", opacity: "0" },
        },
        "cell-ripple": {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
          "100%": { opacity: "0.4" },
        },
        moveHorizontal: {
          "0%": { transform: "translateX(-50%) translateY(-10%)" },
          "50%": { transform: "translateX(50%) translateY(10%)" },
          "100%": { transform: "translateX(-50%) translateY(-10%)" },
        },
        moveInCircle: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        moveVertical: {
          "0%": { transform: "translateY(-50%)" },
          "50%": { transform: "translateY(50%)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [addVariablesForColors, animate],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).flatMap(([key, val]) => [
      [`--${key}`, val],
      [`--color-${key}`, val],
    ])
  );

  addBase({
    ":root": {
      ...newVars,
      "--background": "#000000",
      "--foreground": "#ffffff",
      "--radius": "0.5rem",
    },
  });
}
