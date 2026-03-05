import { getIndexerGraphqlUrl, type AppNetwork } from "@/constants";

/**
 * Normalize address to long hex form (0x + 64 hex chars) for indexer lookup.
 */
function normalizeAddress(addr: string): string {
  let hex = addr.trim().toLowerCase();
  if (hex.startsWith("0x")) hex = hex.slice(2);
  hex = hex.replace(/^0+/, "") || "0";
  if (hex.length > 64) return "0x" + hex.slice(-64);
  return "0x" + hex.padStart(64, "0");
}

/** Response shape from current_ans_lookup_v2 (GraphQL). */
type AnsLookupRow = {
  domain: string | null;
  subdomain: string | null;
  expiration_timestamp?: string | null;
  is_deleted?: boolean | null;
};

/**
 * Resolve an Aptos account address to its ANS name (e.g. "love.apt") via Indexer GraphQL API.
 * Returns null if no active name is found or on error.
 */
export async function getAnsNameByAddress(
  address: string,
  network: AppNetwork
): Promise<string | null> {
  if (!address) return null;
  const indexerUrl = getIndexerGraphqlUrl(network);

  const normalized = normalizeAddress(address);

  const query = `
    query GetNameFromAddress($registered_address: String!) {
      current_ans_lookup_v2(
        where: {
          registered_address: { _eq: $registered_address },
          is_deleted: { _eq: false }
        }
        limit: 1
        order_by: { last_transaction_version: desc }
      ) {
        domain
        subdomain
        expiration_timestamp
      }
    }
  `;

  try {
    const res = await fetch(indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { registered_address: normalized },
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data?.current_ans_lookup_v2 as AnsLookupRow[] | undefined;
    if (!Array.isArray(data) || data.length === 0) return null;

    const row = data[0];
    if (row.is_deleted) return null;

    const now = new Date().toISOString();
    if (row.expiration_timestamp && row.expiration_timestamp < now) return null;

    const domain = row.domain ?? "";
    const subdomain = row.subdomain ?? "";
    if (!domain) return null;

    const name = subdomain ? `${subdomain}.${domain}` : domain;
    return name || null;
  } catch {
    return null;
  }
}
