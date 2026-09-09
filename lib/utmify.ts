type UtmifyConnection = {
  configured: boolean;
  connected: boolean;
};

/** Confirma o endpoint MCP sem expor URL ou token ao navegador. */
export async function getUtmifyConnection(): Promise<UtmifyConnection> {
  const endpoint = process.env.UTMIFY_MCP_URL;
  if (!endpoint) return { configured: false, connected: false };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json, text/event-stream", "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "volkov-healthcheck",
        method: "initialize",
        params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "volkov-hub", version: "0.1.0" } },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    return { configured: true, connected: response.ok };
  } catch {
    return { configured: true, connected: false };
  }
}
