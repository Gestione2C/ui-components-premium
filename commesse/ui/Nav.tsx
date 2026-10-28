import React from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, DesktopSidebar, useSidebar } from "@/components/sidebar";
import type { PageDef } from "../views";

function NavItem({ p, active, onGo }: { p: PageDef; active: boolean; onGo: () => void }) {
  const { open, animate } = useSidebar();
  const Icon = p.icon;
  return (
    <button
      type="button"
      onClick={onGo}
      aria-current={active ? "page" : undefined}
      title={p.label}
      className={cn(
        "group/nav flex w-full cursor-pointer items-center gap-3 border-l-2 px-[17px] py-2.5 text-left font-cmmono text-xs transition-colors duration-150",
        active ? "border-cm-accent bg-cm-accent/[0.07] text-cm-accent" : "border-transparent text-cm-muted hover:bg-white/[0.03] hover:text-cm-ink",
      )}
    >
      <Icon size={18} className="shrink-0" />
      <motion.span animate={{ opacity: animate ? (open ? 1 : 0) : 1 }} className="whitespace-nowrap">
        {p.label}
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
