import type { Product } from "./types";

export type AgentAction =
  | { type: "SEARCH"; query: string }
  | { type: "COMPARE"; productIds: string[] }
  | { type: "TRY_ON"; productIds: string[] }
  | { type: "ADD_TO_DRAFT_CART"; productId: string; qty: number }
  | { type: "REQUEST_CHECKOUT_APPROVAL"; cartId: string };

export type AgentState = "IDLE" | "UNDERSTANDING" | "SEARCHING" | "STYLING" | "TRYING_ON" | "REFINING" | "CART_READY" | "AWAITING_APPROVAL" | "DONE" | "ERROR";

export type AgentEvent =
  | { type: "STATUS"; message: string }
  | { type: "PRODUCTS_FOUND"; count: number }
  | { type: "LOOK_READY"; lookId: string }
  | { type: "TRYON_READY"; imageUrl: string }
  | { type: "CART_UPDATED"; total: number }
  | { type: "APPROVAL_REQUIRED"; cartId: string }
  | { type: "ERROR"; message: string };

export type ToolPermission = "read" | "draft" | "approval";
export type ToolSpec = { name: string; permission: ToolPermission; timeoutMs: number; mutatesShoppingState: boolean };

export const tools = {
  searchProducts: { name: "search_products", permission: "read", timeoutMs: 7000, mutatesShoppingState: false },
  rankProducts: { name: "rank_products", permission: "read", timeoutMs: 5000, mutatesShoppingState: false },
  tryOn: { name: "try_on", permission: "read", timeoutMs: 30000, mutatesShoppingState: false },
  addDraftCart: { name: "add_draft_cart", permission: "draft", timeoutMs: 5000, mutatesShoppingState: true },
  checkoutApproval: { name: "checkout_approval", permission: "approval", timeoutMs: 5000, mutatesShoppingState: true },
} satisfies Record<string, ToolSpec>;

export function canExecute(action: AgentAction) {
  return action.type !== "REQUEST_CHECKOUT_APPROVAL";
}

export function nextAgentState(state: AgentState, event: string): AgentState {
  const map: Record<string, AgentState> = {
    "IDLE:START": "UNDERSTANDING",
    "UNDERSTANDING:INTENT_READY": "SEARCHING",
    "SEARCHING:RESULTS": "STYLING",
    "STYLING:LOOK_READY": "TRYING_ON",
    "TRYING_ON:RESULT": "CART_READY",
    "CART_READY:EDIT": "REFINING",
    "CART_READY:BUY": "AWAITING_APPROVAL",
    "AWAITING_APPROVAL:APPROVE": "DONE",
    "ERROR:RETRY": "SEARCHING",
  };
  return map[`${state}:${event}`] ?? state;
}

export function budgetScore(priceCents: number, budgetCents: number, mode: "hard_max" | "target") {
  if (mode === "hard_max" && priceCents > budgetCents) return Number.NEGATIVE_INFINITY;
  return 1 / (1 + Math.abs(priceCents - budgetCents));
}

export function scoreProduct(product: Product, intent: { budgetCents?: number; colors?: string[]; requiredCategories?: string[] }) {
  if (intent.budgetCents != null && product.priceCents > intent.budgetCents) return Number.NEGATIVE_INFINITY;
  let score = 0;
  if (intent.colors?.some((color) => product.color.toLowerCase().includes(color.toLowerCase()))) score += 2;
  if (intent.requiredCategories?.includes(product.category)) score += 3;
  if (product.sizes?.length) score += 1;
  if (intent.budgetCents) score += Math.max(0, 2 - product.priceCents / intent.budgetCents);
  return score;
}

export function dedupeCandidates(items: Product[]) {
  const seen = new Set<string>();
  return items.filter((product) => {
    const key = `${product.name.toLowerCase()}|${product.brand.toLowerCase()}|${Math.round(product.priceCents)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 24);
}

export function idempotencyKey(sessionId: string, action: string, itemId: string) {
  return `${sessionId}:${action}:${itemId}`;
}

export type DraftCartStatus = "draft" | "awaiting_approval" | "approved" | "submitted";
export type DraftCartLine = { productId: string; qty: number; priceCents: number };
export type DraftCart = { id: string; lines: DraftCartLine[]; subtotalCents: number; status: DraftCartStatus };
export type CartAction =
  | { type: "ADD"; line: DraftCartLine }
  | { type: "REMOVE"; productId: string }
  | { type: "QTY"; productId: string; qty: number };

export function cartReducer(cart: DraftCart, action: CartAction): DraftCart {
  let lines = [...cart.lines];
  if (action.type === "ADD") {
    const existing = lines.find((line) => line.productId === action.line.productId);
    lines = existing ? lines.map((line) => line.productId === action.line.productId ? { ...line, qty: line.qty + action.line.qty } : line) : [...lines, action.line];
  }
  if (action.type === "REMOVE") lines = lines.filter((line) => line.productId !== action.productId);
  if (action.type === "QTY") lines = action.qty <= 0 ? lines.filter((line) => line.productId !== action.productId) : lines.map((line) => line.productId === action.productId ? { ...line, qty: action.qty } : line);
  return { ...cart, lines, subtotalCents: lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0) };
}

export function isBlocked(action: string) {
  return ["purchase_without_approval", "fabricate_stock", "fabricate_discount", "claim_order_paid"].includes(action);
}

export function groundProduct(product: Product) {
  return { id: product.id, priceCents: product.priceCents, currency: product.currency ?? "USD", color: product.color, sizes: product.sizes ?? [], availability: product.availability ?? "unknown", merchant: product.brand, productUrl: product.merchantUrl, dataSource: product.dataSource ?? "seed", sourceName: product.sourceName ?? "MirrorCart demo catalog" };
}
