import { BarChart3, BellRing, Clapperboard, Eye, Facebook, Link2, Package, Plug, Settings, Users, WalletCards, type LucideIcon } from "lucide-react";

export type NavigationItem = { href: string; label: string; icon: LucideIcon };

export const operationalNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/paginas-internas", label: "Páginas internas", icon: Facebook },
  { href: "/paginas-monitoradas", label: "Páginas monitoradas", icon: Eye },
  { href: "/videos-validados", label: "Vídeos validados", icon: Clapperboard },
  { href: "/inspiracoes", label: "Inspirações", icon: BellRing },
  { href: "/utms", label: "UTMs", icon: Link2 },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/financeiro", label: "Financeiro", icon: WalletCards },
  { href: "/integracoes", label: "Integrações", icon: Plug },
];

export const administrativeNavigation: NavigationItem[] = [
  { href: "/usuarios", label: "Usuários", icon: Users },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
