import type { LookCategory, Product } from "@/shared/types";

const LOOK_CATEGORIES: LookCategory[] = ["dress", "top", "bottom", "shoes", "bag", "accessory"];

export function normalizeOwnedProducts(input: unknown): Product[] {
  if (!Array.isArray(input)) return [];
  return input.filter((candidate): candidate is Product => {
    if (!candidate || typeof candidate !== "object") return false;
    const product = candidate as Partial<Product>;
    return typeof product.id === "string" && LOOK_CATEGORIES.includes(product.category as LookCategory) && product.owned === true;
  });
}

export function wardrobeGaps(products: unknown): LookCategory[] {
  const ownedCategories = new Set(normalizeOwnedProducts(products).map((product) => product.category));
  return LOOK_CATEGORIES.filter((category) => !ownedCategories.has(category));
}

export function wardrobeFit(product: Product, ownedProducts: unknown): { score: number; label: string } {
  if (product.owned) return { score: 1, label: "Already in your wardrobe" };
  const ownsCategory = normalizeOwnedProducts(ownedProducts).some((owned) => owned.category === product.category);
  if (ownsCategory) return { score: 0.45, label: "A considered update to a category you own" };
  return { score: 0.8, label: "Fills a wardrobe gap" };
}

export function rankProductsByWardrobe(products: Product[], ownedProducts: unknown): Product[] {
  return products
    .map((product, index) => ({ product, index, score: wardrobeFit(product, ownedProducts).score }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ product }) => product);
}

export function rankLooksByWardrobe<T extends { items: Product[] }>(looks: T[], ownedProducts: unknown): T[] {
  return looks
    .map((look, index) => ({ look, index, score: look.items.reduce((sum, product) => sum + wardrobeFit(product, ownedProducts).score, 0) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ look }) => look);
}

export function lookWardrobeRationale(items: Product[], ownedProducts: unknown): string {
  if (items.length > 0 && items.every((product) => product.owned)) return "Built entirely from your wardrobe";
  if (normalizeOwnedProducts(ownedProducts).length > 0 && items.some((product) => wardrobeFit(product, ownedProducts).label === "Fills a wardrobe gap")) return "Adds a piece from a wardrobe gap";
  if (items.some((product) => product.owned)) return "Uses a piece you already own";
  return "A fresh edit for your current brief";
}
