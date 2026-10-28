import React from "react";
import { createRoot } from "react-dom/client";
import "./commesse.css";
import App from "./App";
import { applyStartup } from "./engine/startup";

applyStartup();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
