import type { Product } from "./types";
import type { DataSource } from "./data-source";

export type CatalogPage = {
  items: Product[];
  source: DataSource;
  fetchedAt: string;
  nextCursor?: string;
};

export function hydrateCatalog(live: CatalogPage | undefined, cached: CatalogPage | undefined, seed: CatalogPage): CatalogPage {
  if (live?.items.length) return { ...live, source: "api" };
  if (cached?.items.length) return { ...cached, source: "cache" };
  return { ...seed, source: "seed" };
}

export function isProductFresh(product: Product, now = Date.now(), maxAgeMs = 15 * 60 * 1000) {
  if (!product.lastCheckedAt) return false;
  const checked = Date.parse(product.lastCheckedAt);
  return Number.isFinite(checked) && now - checked <= maxAgeMs;
}

export function availabilityCopy(product: Product) {
  if (product.availability === "unavailable") return product.availabilityReason ?? "Unavailable at last check";
  if (product.availability === "limited") return product.availabilityReason ?? "Limited availability at last check";
  if (product.availability === "in_stock") return "In stock at last check";
  return "Confirm availability with the merchant";
}
