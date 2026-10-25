import { useEffect, useState } from "react";

// Stand-in for next-themes: reads the `dark` class on <html>.
export const useTheme = () => {
  const read = () =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return { theme };
};
