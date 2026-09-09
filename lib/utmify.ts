import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type ToolText = { type: string; text?: string };
type UtmifyRawSummary = {
  ordersCount: { approved: number };
  comissions: { gross: number; net: number };
  ads: { spent: number };
  analytics: { profit: number; roas: number | null; avgTicket: number | null; cpa: number | null };
  hourlyCumulative: { revenueByHourNetCumulative: { hour: number; cents: number }[]; investmentByHourCumulative: { hour: number; cents: number }[]; profitByHourNetCumulative: { hour: number; cents: number }[] };
};

export type UtmifySummary = {
  currency: string;
  gross: number;
  net: number;
  costs: number;
  profit: number;
  sales: number;
  roas: number | null;
  avgTicket: number | null;
  cpa: number | null;
  chart: { day: string; receita: number; gastos: number; lucro: number }[];
};

let cachedSummary: { expiresAt: number; value: UtmifySummary | null } | null = null;

function extractJson(result: unknown) {
  const content = (result as { content?: ToolText[] }).content || [];
  const text = content.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("A UTMify não retornou dados para esta consulta.");
  return JSON.parse(text) as unknown;
}

function dateRange() {
  const now = new Date();
  const to = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const from = new Date(to);
  from.setUTCDate(to.getUTCDate() - 6);
  const iso = (date: Date, end = false) => `${date.toISOString().slice(0, 10)}T${end ? "23:59:59" : "00:00:00"}-03:00`;
  return { from: iso(from), to: iso(to, true) };
}

/** Busca o resumo real da UTMify no servidor. O token nunca chega ao navegador. */
export async function getUtmifySummary(): Promise<UtmifySummary | null> {
  if (cachedSummary && cachedSummary.expiresAt > Date.now()) return cachedSummary.value;
  const endpoint = process.env.UTMIFY_MCP_URL;
  if (!endpoint) return null;

  const client = new Client({ name: "volkov-hub", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  try {
    await client.connect(transport);
    const dashboards = extractJson(await client.callTool({ name: "get_dashboards", arguments: {} })) as { id: string; currency: string }[];
    const dashboard = dashboards[0];
    if (!dashboard) return null;
    const raw = extractJson(await client.callTool({ name: "get_dashboard_summary", arguments: { dashboardId: dashboard.id, dateRange: dateRange() } })) as UtmifyRawSummary;
    const byHour = (raw.hourlyCumulative.revenueByHourNetCumulative || []).map((entry, index) => ({
      day: `${String(entry.hour).padStart(2, "0")}h`,
      receita: entry.cents / 100,
      gastos: (raw.hourlyCumulative.investmentByHourCumulative[index]?.cents || 0) / 100,
      lucro: (raw.hourlyCumulative.profitByHourNetCumulative[index]?.cents || 0) / 100,
    }));
    const value: UtmifySummary = { currency: dashboard.currency || "BRL", gross: raw.comissions.gross / 100, net: raw.comissions.net / 100, costs: raw.ads.spent / 100, profit: raw.analytics.profit / 100, sales: raw.ordersCount.approved, roas: raw.analytics.roas, avgTicket: raw.analytics.avgTicket ? raw.analytics.avgTicket / 100 : null, cpa: raw.analytics.cpa ? raw.analytics.cpa / 100 : null, chart: byHour };
    cachedSummary = { value, expiresAt: Date.now() + 60_000 };
    return value;
  } catch {
    cachedSummary = { value: null, expiresAt: Date.now() + 15_000 };
    return null;
  } finally {
    await transport.close().catch(() => undefined);
  }
}

export async function getUtmifyConnection() {
  const summary = await getUtmifySummary();
  return { configured: Boolean(process.env.UTMIFY_MCP_URL), connected: Boolean(summary) };
}
