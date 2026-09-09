"use client";

import { operationalNavigation, administrativeNavigation, type NavigationItem } from "@/lib/navigation";
import { Activity, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const item = (entry: NavigationItem) => {
    const Icon = entry.icon;
    const active = pathname === entry.href || (entry.href !== "/dashboard" && pathname.startsWith(`${entry.href}/`));
    return <Link onClick={onNavigate} key={entry.href} href={entry.href} className={`nav-link ${active ? "nav-link-active" : ""}`}><Icon size={16} strokeWidth={active ? 2.2 : 1.75}/><span className="flex-1">{entry.label}</span>{active && <ChevronRight size={14} className="text-[var(--gold)]"/>}</Link>;
  };
  return <><p className="eyebrow mb-2 px-2">OPERAÇÃO</p><div className="space-y-1">{operationalNavigation.map(item)}</div><div className="mt-6 border-t border-[var(--line)] pt-5"><p className="eyebrow mb-2 px-2">ADMINISTRAÇÃO</p><div className="space-y-1">{administrativeNavigation.map(item)}</div></div></>;
}

export function AppSidebar() {
  return <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[var(--line)] bg-[oklch(0.115_0.003_25)] p-4 lg:flex"><div className="flex h-14 items-center border-b border-[var(--line)] px-1 pb-4"><Brand/></div><nav className="mt-6 overflow-y-auto"><NavigationLinks/></nav><div className="mt-auto rounded-xl border border-[var(--line)] bg-[oklch(0.14_0.005_25)] p-3.5"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--gold-soft)] text-[var(--gold)]"><Activity size={15}/></span><p className="m-0 text-xs font-semibold text-white">Operação conectada</p></div><p className="mb-0 mt-2 text-[11px] leading-5 text-[var(--muted)]">Cadastre ativos e importe resultados sem depender de integrações fictícias.</p></div></aside>;
}
