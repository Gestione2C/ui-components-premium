import React from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, DesktopSidebar, useSidebar } from "@/components/sidebar";
import type { PageDef } from "../views";
import { S, cwRowsOpen, openBlocks } from "../engine/state";
import { azOpen } from "../engine/calc";
import { P } from "../theme";
import { useS } from "./useS";

/** Contatori "vivi" sulle voci di menu: quante cose richiedono attenzione. */
function badgeOf(id: string): { n: number; color: string } | null {
  if (!S.rows.length) return null;
  const open = cwRowsOpen();
  if (id === "scadenze") return { n: open.filter((r) => r.in_ritardo).length, color: P.bad };
  if (id === "bloccanti") return { n: open.reduce((a, r) => a + openBlocks(r.n).length, 0), color: P.orange };
  if (id === "azioni") return { n: azOpen().length, color: P.warn };
  return null;
}

function NavItem({ p, active, onGo }: { p: PageDef; active: boolean; onGo: () => void }) {
  const { open, animate } = useSidebar();
  useS();
  const badge = badgeOf(p.id);
  const Icon = p.icon;
  return (
    <button
      type="button"
      onClick={onGo}
      aria-current={active ? "page" : undefined}
      title={p.label}
      className={cn(
        "group/nav relative flex w-full cursor-pointer items-center gap-3 px-[19px] py-2.5 text-left font-cmmono text-xs transition-colors duration-150",
        active ? "text-cm-accent" : "text-cm-muted hover:bg-white/[0.03] hover:text-cm-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-0 border-l-2 border-cm-accent bg-cm-accent/[0.08]"
        />
      )}
      <span className="relative shrink-0">
        <Icon size={18} />
        {badge && badge.n > 0 && (
          <motion.span
            key={badge.n}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 16 }}
            className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full"
            style={{ background: badge.color, boxShadow: `0 0 0 0 ${badge.color}` }}
            aria-hidden="true"
          />
        )}
      </span>
      <motion.span animate={{ opacity: animate ? (open ? 1 : 0) : 1 }} className="relative whitespace-nowrap">
        {p.label}
        {badge && badge.n > 0 && (
          <span className="num ml-2 rounded-full px-1.5 py-px text-[10px] font-semibold" style={{ background: badge.color + "26", color: badge.color }}>
            {badge.n}
          </span>
        )}
      </motion.span>
    </button>
  );
}

export function Nav({ pages, page, onGo }: { pages: PageDef[]; page: string; onGo: (id: string) => void }) {
  const [mobile, setMobile] = React.useState(false);
  const groups: PageDef[][] = [];
  pages.forEach((p) => {
    if (!groups[p.group]) groups[p.group] = [];
    groups[p.group].push(p);
  });
  const list = (close?: boolean) =>
    groups.map((g, gi) => (
      <div key={gi} className={cn(gi > 0 && "mt-2 border-t border-cm-line pt-2")}>
        {g.map((p) => (
          <NavItem
            key={p.id}
            p={p}
            active={p.id === page}
            onGo={() => {
              onGo(p.id);
              if (close) setMobile(false);
            }}
          />
        ))}
      </div>
    ));
  return (
    <>
      <Sidebar>
        <DesktopSidebar
          openWidth="220px"
          closedWidth="56px"
          className="no-print !h-auto overflow-y-auto overflow-x-hidden !bg-cm-surface !px-0 !py-2 border-r border-cm-line"
          aria-label="Navigazione"
        >
          <nav>{list()}</nav>
        </DesktopSidebar>
      </Sidebar>
      <div className="no-print md:hidden">
        <button
          type="button"
          aria-label="Apri menu"
          onClick={() => setMobile(true)}
          className="fixed bottom-4 left-4 z-[150] cursor-pointer rounded-full border border-cm-line2 bg-cm-surface2 p-3 text-cm-accent shadow-lg"
        >
          <Menu size={20} />
        </button>
        {mobile && (
          <div className="fixed inset-0 z-[200] bg-black/70" onClick={() => setMobile(false)}>
            <nav className="h-full w-64 overflow-y-auto border-r border-cm-line bg-cm-surface py-3" onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-label="Chiudi menu" onClick={() => setMobile(false)} className="absolute right-3 top-3 cursor-pointer text-cm-faint">
                <X size={18} />
              </button>
              <Sidebar open animate={false}>
                {list(true)}
              </Sidebar>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}
