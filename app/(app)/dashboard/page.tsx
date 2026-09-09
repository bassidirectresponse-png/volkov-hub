import { DashboardChart } from "@/components/dashboard-chart";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, CircleDollarSign, MousePointerClick, ReceiptText, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function Dashboard() {
  const supabase = await createClient();
  let sales: Record<string, unknown>[] = [];
  let spend: Record<string, unknown>[] = [];
  if (supabase) [sales, spend] = await Promise.all([
    supabase.from("sales").select("net_revenue,gross_revenue,sold_at").order("sold_at", { ascending: true }).limit(1000).then(result => result.data || []),
    supabase.from("ad_spend").select("amount,spent_at").order("spent_at", { ascending: true }).limit(1000).then(result => result.data || []),
  ]);
  const gross = sales.reduce((sum, item) => sum + Number(item.gross_revenue || 0), 0);
  const net = sales.reduce((sum, item) => sum + Number(item.net_revenue || 0), 0);
  const costs = spend.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const metrics = [
    { label: "Faturamento bruto", value: currency.format(gross), icon: CircleDollarSign, tone: "text-[var(--gold)]" },
    { label: "Faturamento líquido", value: currency.format(net), icon: ReceiptText, tone: "text-[#e4d7b4]" },
    { label: "Gastos", value: currency.format(costs), icon: MousePointerClick, tone: "text-[#d5b6b1]" },
    { label: "Lucro", value: currency.format(net - costs), icon: TrendingUp, tone: "text-[#9bd2ac]" },
    { label: "Vendas", value: String(sales.length), icon: ShoppingBag, tone: "text-[#c4c9e8]" },
    { label: "ROAS", value: costs ? `${(net / costs).toFixed(2)}x` : "—", icon: TrendingUp, tone: "text-[var(--gold)]" },
  ];
  const byDate = new Map<string, { day: string; receita: number; gastos: number; lucro: number }>();
  sales.forEach(sale => { const day = String(sale.sold_at || "").slice(0, 10); if (!day) return; const row = byDate.get(day) || { day, receita: 0, gastos: 0, lucro: 0 }; row.receita += Number(sale.net_revenue || 0); byDate.set(day, row); });
  spend.forEach(item => { const day = String(item.spent_at || "").slice(0, 10); if (!day) return; const row = byDate.get(day) || { day, receita: 0, gastos: 0, lucro: 0 }; row.gastos += Number(item.amount || 0); byDate.set(day, row); });
  const chart = Array.from(byDate.values()).map(item => ({ ...item, lucro: item.receita - item.gastos }));
  return <div className="space-y-6"><section className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow m-0">VISÃO EXECUTIVA</p><h1 className="page-title mt-2">Central de performance</h1><p className="mb-0 mt-1.5 text-sm text-[var(--muted)]">Acompanhe a operação a partir dos registros reais do Volkov Hub.</p></div><Link href="/utms" className="btn btn-primary text-xs">Criar link UTM <ArrowRight size={15}/></Link></section><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{metrics.map(({ label, value, icon: Icon, tone }) => <article key={label} className="panel metric-card px-4 py-4"><div className="flex items-center justify-between"><p className="m-0 text-[11px] font-semibold text-[var(--muted)]">{label}</p><Icon size={16} className={tone}/></div><p className="mb-0 mt-3 text-[22px] font-semibold tracking-[-.025em] text-white">{value}</p></article>)}</section><section className="grid gap-5 xl:grid-cols-[minmax(0,1.72fr)_minmax(300px,.8fr)]"><article className="panel overflow-hidden"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4"><div><p className="eyebrow m-0">RESULTADO</p><h2 className="mb-0 mt-1 text-sm font-semibold text-white">Receita, gastos e lucro</h2></div><div className="flex gap-3 text-[11px] font-medium text-[var(--muted)]"><span><i className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--wine)]"/>Receita</span><span><i className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#928681]"/>Gastos</span><span><i className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]"/>Lucro</span></div></div><DashboardChart data={chart}/></article><article className="panel"><div className="border-b border-[var(--line)] px-5 py-4"><p className="eyebrow m-0">CONFIGURAÇÃO</p><h2 className="mb-0 mt-1 text-sm font-semibold text-white">Próximos passos</h2></div><div className="divide-y divide-[var(--line)]">{[{ href: "/produtos", title: "Cadastre seus produtos", copy: "Conecte páginas, vídeos e links ao catálogo." }, { href: "/paginas-internas", title: "Registre suas páginas", copy: "Defina ativos, responsáveis e seus status." }, { href: "/integracoes", title: "Traga seus dados", copy: "Importe um CSV ou configure uma integração autorizada." }].map((step, index) => <Link key={step.href} href={step.href} className="group flex gap-3 px-5 py-4 transition-colors hover:bg-white/[.025]"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--gold-soft)] text-[11px] font-bold text-[var(--gold)]">{index + 1}</span><span><span className="flex items-center gap-1 text-xs font-semibold text-white">{step.title}<ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100"/></span><span className="mt-1 block text-[11px] leading-5 text-[var(--muted)]">{step.copy}</span></span></Link>)}</div></article></section>{!supabase && <section className="panel"><EmptyState title="Conecte seu Supabase para iniciar" description="Inclua as variáveis do Supabase na plataforma de deploy e aplique a migration antes de cadastrar dados."/></section>}</div>;
}
