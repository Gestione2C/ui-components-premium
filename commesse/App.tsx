import React, { useState } from "react";
import Header from "./ui/Header";
import { Nav } from "./ui/Nav";
import Toast from "./ui/Toast";
import Backdrop from "./ui/Backdrop";
import { PAGES } from "./views";
import { S } from "./engine/state";
import { Empty, GlowBtn } from "./ui/primitives";
import { useS } from "./ui/useS";
import { GoContext } from "./ui/go";
import CommessaModal from "./modals/CommessaModal";
import SettingsModal from "./modals/SettingsModal";

export default function App() {
  useS();
  const [page, setPage] = useState("upload");
  const def = PAGES.find((p) => p.id === page) || PAGES[0];
  const blocked = !S.rows.length && !def.standalone;
  return (
    <div className="relative flex h-screen flex-col bg-cm-bg">
      <Backdrop />
      <Header />
      <div className="cm-shell relative z-[1] flex min-h-0 flex-1">
        <Nav pages={PAGES} page={page} onGo={setPage} />
        <main className="cm-main min-w-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
          <div key={def.id} className="cm-fade mx-auto max-w-[1500px]">
            {blocked ? (
              <div className="mt-16 flex flex-col items-center gap-3 text-center">
                <Empty>Carica i file delle commesse per vedere questa pagina.</Empty>
                <GlowBtn onClick={() => setPage("upload")}>Vai a Carica file</GlowBtn>
              </div>
            ) : (
              <PageHost id={def.id} onGo={setPage} />
            )}
          </div>
        </main>
      </div>
      <CommessaModal />
      <SettingsModal />
      <Toast />
    </div>
  );
}

function PageHost({ id, onGo }: { id: string; onGo: (id: string) => void }) {
  const C = PAGES.find((p) => p.id === id)!.Component;
  return (
    <GoContext.Provider value={onGo}>
      <C />
    </GoContext.Provider>
  );
}
