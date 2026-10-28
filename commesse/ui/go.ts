import { createContext, useContext } from "react";
/** Navigazione tra pagine: `const go = useGo(); go("gestione")` */
export const GoContext = createContext<(id: string) => void>(() => {});
export const useGo = () => useContext(GoContext);
