import type { Product } from "../shared/types";

export type AvailabilityRefreshMode = "live" | "demo" | "unavailable";

export interface AvailabilityRefreshResult {
  mode: AvailabilityRefreshMode;
  checkedAt: string;
  items: Product[];
  message: string;
}

type CloverItem = {
  id?: string;
  name?: string;
  sku?: string;
  itemStock?: { quantity?: number };
};

const normalize = (value: string | undefined) => (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const demoRefresh = (products: Product[], checkedAt: string): AvailabilityRefreshResult => ({
  mode: "demo",
  checkedAt,
  items: products.map((product) => ({ ...product, dataSource: "seed", lastCheckedAt: undefined, availabilityReason: "Demo availability — confirm with merchant" })),
  message: "Live merchant credentials are not connected. Showing demo availability; confirm with the merchant before purchase.",
});

function mapCloverItem(product: Product, item: CloverItem | undefined, checkedAt: string): Product {
  if (!item) {
    return { ...product, availability: "unknown", availabilityReason: "No matching merchant item was found", dataSource: "api", sourceName: "Clover", lastCheckedAt: checkedAt };
  }
  const quantity = item.itemStock?.quantity;
  const availability = typeof quantity === "number" ? quantity <= 0 ? "unavailable" : quantity <= 3 ? "limited" : "in_stock" : "unknown";
  return {
    ...product,
    availability,
    availabilityReason: availability === "in_stock" ? "Live merchant inventory" : availability === "limited" ? `Only ${quantity} left at merchant` : availability === "unavailable" ? "Out of stock at merchant" : "Stock quantity unavailable",
    dataSource: "api",
    sourceName: "Clover",
    lastCheckedAt: checkedAt,
  };
}

export async function refreshCloverAvailability(products: Product[], fetcher: typeof fetch = fetch): Promise<AvailabilityRefreshResult> {
  const checkedAt = new Date().toISOString();
  const token = process.env.CLOVER_API_TOKEN;
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  if (!token || !merchantId) return demoRefresh(products, checkedAt);

  try {
    const response = await fetcher(`https://api.clover.com/v3/merchants/${encodeURIComponent(merchantId)}/items?expand=itemStock&limit=1000`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
    if (!response.ok) throw new Error(`Clover returned ${response.status}`);
    const payload = await response.json() as { elements?: CloverItem[] };
    const items = payload.elements ?? [];
    const byKey = new Map<string, CloverItem>();
    for (const item of items) for (const key of [item.id, item.sku, item.name].map(normalize).filter(Boolean)) byKey.set(key, item);
    return { mode: "live", checkedAt, items: products.map((product) => mapCloverItem(product, byKey.get(normalize(product.id)) ?? byKey.get(normalize(product.name)), checkedAt)), message: "Live merchant inventory refreshed. Review the updated availability before approval." };
  } catch {
    return { mode: "unavailable", checkedAt, items: products.map((product) => ({ ...product, availability: "unknown", availabilityReason: "Live refresh unavailable — confirm with merchant", dataSource: "cache", sourceName: "Clover", lastCheckedAt: checkedAt })), message: "Live merchant refresh was unavailable. Nothing changed in the draft; confirm availability with the merchant." };
  }
}
