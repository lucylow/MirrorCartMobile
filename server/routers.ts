import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import type { CartState, Look, Product, ProgressEvent, StylingIntent, StylingSession } from "../shared/types";
import { deleteArchivedSessionDurable, getSessionDurable, listSessionsDurable, persistCart, persistSession, replaceLookDurable, updateSessionDurable } from "./session-store";
import { getVtoProvider } from "./vto";
import { canExecute, cartReducer, dedupeCandidates, groundProduct, isBlocked } from "../shared/agentic";
import { sourceLabel, type DataSource } from "../shared/data-source";
import { availabilityCopy, isProductFresh } from "../shared/catalog";
import { rankLooksByWardrobe } from "../lib/wardrobe-personalization";
import { consumeCartApproval, createCartApproval, getCartDurable } from "./session-store";
import { refreshCloverAvailability } from "./merchant-availability";

const productCatalog: Product[] = [
  { id: "dress-001", name: "Satin Column Dress", brand: "Atelier North", category: "dress", priceCents: 8900, imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80", merchantUrl: "https://example.com/atelier-north-satin-dress", color: "ink" },
  { id: "dress-002", name: "Cherry Slip Dress", brand: "Morrow", category: "dress", priceCents: 9900, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80", merchantUrl: "https://example.com/morrow-cherry-slip", color: "cherry" },
  { id: "shoe-001", name: "Sculpted Kitten Heel", brand: "Nola Studio", category: "shoes", priceCents: 5400, imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80", merchantUrl: "https://example.com/nola-kitten-heel", color: "black" },
  { id: "shoe-002", name: "Metallic Slingback", brand: "Nola Studio", category: "shoes", priceCents: 6200, imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=80", merchantUrl: "https://example.com/nola-slingback", color: "silver" },
  { id: "bag-001", name: "Cherry Mini Shoulder Bag", brand: "Morrow", category: "bag", priceCents: 3300, imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80", merchantUrl: "https://example.com/morrow-cherry-bag", color: "cherry" },
  { id: "bag-002", name: "Soft Leather Pouch", brand: "Common Form", category: "bag", priceCents: 4100, imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80", merchantUrl: "https://example.com/common-form-pouch", color: "camel" },
];

const productInput = z.object({ id: z.string(), name: z.string(), brand: z.string(), category: z.enum(["dress", "top", "bottom", "shoes", "bag", "accessory"]), priceCents: z.number().nonnegative(), imageUrl: z.string().url(), merchantUrl: z.string().url(), color: z.string(), currency: z.string().optional(), sizes: z.array(z.string()).optional(), availability: z.enum(["in_stock", "limited", "unavailable", "unknown"]).optional(), dataSource: z.enum(["api", "cache", "seed"]).optional(), sourceName: z.string().optional(), owned: z.boolean().optional() });

const progress = (status: string): ProgressEvent[] => [
  { id: "intent", label: "Understanding your style", detail: "Occasion, budget, and mood captured", done: true },
  { id: "products", label: "Finding products", detail: "Matching pieces from the catalog", done: ["composing", "trying_on", "ready", "refining", "cart_ready"].includes(status) },
  { id: "looks", label: "Building complete looks", detail: "Balancing color, category, and price", done: ["trying_on", "ready", "refining", "cart_ready"].includes(status) },
  { id: "budget", label: "Checking budget", detail: "Hard price constraint verified in code", done: ["trying_on", "ready", "refining", "cart_ready"].includes(status) },
  { id: "tryon", label: "Preparing virtual try-on", detail: "Provider adapter ready for image processing", done: ["ready", "cart_ready"].includes(status) },
];

export const total = (items: Product[]) => items.reduce((sum, item) => sum + item.priceCents, 0);

export const draftWarnings = (cart: CartState) => cart.items.filter(({ product }) => !product.owned && product.availability !== "in_stock").map(({ product }) => `${product.name}: ${availabilityCopy(product)}`);
export const cartContainsProduct = (cart: CartState, productId: string) => cart.items.some(({ product }) => product.id === productId);
export const markCartApproved = (cart: CartState): CartState => ({ ...cart, status: "approved", approvalExpiresAt: undefined });

export function composeLooks(intent: StylingIntent): Look[] {
  const ownedHeel = intent.ownedItems.some((item) => item.toLowerCase().includes("heel"));
  const shoe = ownedHeel ? { ...productCatalog[2], owned: true, priceCents: 0 } : productCatalog[3];
  const minimalItems = [productCatalog[0], shoe, productCatalog[5]];
  const romanticItems = [productCatalog[1], shoe, productCatalog[4]];
  const statementItems = [productCatalog[1], productCatalog[2], productCatalog[5]];
  const looks = [
    { id: "look-01", title: "Minimal Chic", subtitle: "Clean lines, quiet confidence", rationale: "A streamlined silhouette keeps the look elegant while leaving room for your own accessories.", items: minimalItems, totalCents: total(minimalItems), status: "draft" as const },
    { id: "look-02", title: "Modern Romantic", subtitle: "A little color, still effortless", rationale: "Cherry accents create a memorable focal point without pushing the outfit past polished.", items: romanticItems, totalCents: total(romanticItems), status: "draft" as const },
    { id: "look-03", title: "Statement Guest", subtitle: "Soft shine after dark", rationale: "A richer palette and metallic detail make this the most expressive option for the evening.", items: statementItems, totalCents: total(statementItems), status: "draft" as const },
  ].map((look) => ({ ...look, status: look.totalCents <= intent.budgetCents ? "draft" as const : "error" as const }));
  return intent.mode === "closet" && ownedHeel ? rankLooksByWardrobe(looks, [shoe]) : looks;
}

export const appRouter = router({
  auth: router({
    logout: publicProcedure.mutation(() => ({ success: true })),
  }),
  health: publicProcedure.query(() => ({ status: "ok", service: "mirrorcart-agent" })),
  catalog: router({
    status: publicProcedure.query(() => ({ source: "seed" as DataSource, label: sourceLabel("seed"), demo: true, message: "Live catalog credentials are deferred; prices and availability must be confirmed at the merchant." })),
    get: publicProcedure.input(z.object({ productId: z.string() })).query(({ input }) => {
      const product = productCatalog.find((item) => item.id === input.productId);
      if (!product) return null;
      return { product, freshness: product.dataSource === "seed" ? "demo" as const : isProductFresh(product) ? "fresh" as const : "stale" as const, availabilityCopy: availabilityCopy(product) };
    }),
    search: publicProcedure.input(z.object({ query: z.string().default(""), budgetCents: z.number().int().positive().optional() })).query(({ input }) => {
      const query = input.query.trim().toLowerCase();
      const candidates = productCatalog.filter((product) => {
        const searchable = `${product.name} ${product.brand} ${product.category} ${product.color}`.toLowerCase();
        return (!query || searchable.includes(query)) && (!input.budgetCents || product.priceCents <= input.budgetCents);
      });
      return dedupeCandidates(candidates).map(groundProduct);
    }),
  }),
  styling: router({
    start: publicProcedure.input(z.object({ intent: z.object({ mode: z.enum(["occasion", "closet", "fix_outfit"]), request: z.string().min(3), occasion: z.string().default("an evening out"), aesthetic: z.string().default("effortless"), budgetCents: z.number().int().positive(), ownedItems: z.array(z.string()).default([]) }), photoUri: z.string().optional() })).mutation(async ({ input }) => {
      const looks = composeLooks(input.intent);
      const session: StylingSession = { id: `session-${Date.now()}`, intent: input.intent, photoUri: input.photoUri, status: "ready", progress: progress("ready"), looks, selectedLookId: looks[1]?.id };
      return persistSession(session);
    }),
    get: publicProcedure.input(z.object({ sessionId: z.string() })).query(async ({ input }) => (await getSessionDurable(input.sessionId)) ?? null),
    recent: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(8).default(6) }).optional()).query(async ({ input }) => (await listSessionsDurable(input?.limit ?? 6)).filter((session) => !session.archivedAt)),
    archived: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional()).query(async ({ input }) => (await listSessionsDurable(input?.limit ?? 20)).filter((session) => Boolean(session.archivedAt))),
    archive: publicProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input }) => {
      const updated = await updateSessionDurable(input.sessionId, { archivedAt: new Date().toISOString() });
      if (!updated) throw new Error("Styling session not found");
      return { success: true, sessionId: input.sessionId };
    }),
    unarchive: publicProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input }) => {
      const current = await getSessionDurable(input.sessionId);
      if (!current) throw new Error("Styling session not found");
      if (!current.archivedAt) throw new Error("Styling session is already active");
      const updated = await updateSessionDurable(input.sessionId, { archivedAt: undefined });
      if (!updated) throw new Error("Styling session not found");
      return updated;
    }),
    permanentDelete: publicProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input }) => {
      const current = await getSessionDurable(input.sessionId);
      if (!current) throw new Error("Styling session not found");
      if (!current.archivedAt) throw new Error("Archive this styling session before permanently deleting it");
      const deleted = await deleteArchivedSessionDurable(input.sessionId);
      if (!deleted) throw new Error("Styling session could not be deleted. Try again.");
      return { success: true, sessionId: input.sessionId };
    }),
    status: publicProcedure.input(z.object({ sessionId: z.string() })).query(async ({ input }) => {
      const session = await getSessionDurable(input.sessionId);
      if (!session) return { status: "error" as const, progress: progress("error"), message: "Styling session not found. Start a new edit." };
      return { status: session.status, progress: session.progress, selectedLookId: session.selectedLookId };
    }),
    retry: publicProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input }) => {
      const session = await getSessionDurable(input.sessionId);
      if (!session) throw new Error("Styling session not found");
      const updated = await updateSessionDurable(input.sessionId, { status: "ready", progress: progress("ready") });
      return updated;
    }),
    tryOn: publicProcedure.input(z.object({ sessionId: z.string(), lookId: z.string(), photoUri: z.string().optional(), sourceFileId: z.string().optional() })).mutation(async ({ input }) => {
      const session = await getSessionDurable(input.sessionId);
      const look = session?.looks.find((item) => item.id === input.lookId);
      if (!session || !look) throw new Error("Styling session or look not found");
      const photoUri = input.photoUri ?? session.photoUri ?? "";
      const task = await getVtoProvider().createTask({ userImageUrl: photoUri, userFileId: input.sourceFileId, look });
      await updateSessionDurable(input.sessionId, { status: task.status === "ready" ? "ready" : "trying_on", progress: progress(task.status === "ready" ? "ready" : "trying_on"), photoUri, vtoTaskId: task.taskId, vtoProvider: task.provider, vtoPreviewUrl: task.previewUrl });
      return { sessionId: input.sessionId, lookId: input.lookId, status: task.status, provider: task.provider, taskId: task.taskId, previewUrl: task.previewUrl, message: task.message };
    }),
    pollTryOn: publicProcedure.input(z.object({ sessionId: z.string(), lookId: z.string(), taskId: z.string() })).query(async ({ input }) => {
      const session = await getSessionDurable(input.sessionId);
      if (!session?.looks.some((look) => look.id === input.lookId)) throw new Error("Styling session or look not found");
      const task = await getVtoProvider().getTask(input.taskId);
      await updateSessionDurable(input.sessionId, { status: task.status === "ready" ? "ready" : task.status === "error" ? "error" : "trying_on", progress: progress(task.status === "ready" ? "ready" : task.status), vtoTaskId: task.taskId, vtoProvider: task.provider, vtoPreviewUrl: task.previewUrl });
      return task;
    }),
    refine: publicProcedure.input(z.object({ sessionId: z.string(), lookId: z.string(), changeRequest: z.string().min(3), budgetCents: z.number().int().positive() })).mutation(async ({ input }) => {
      const session = await getSessionDurable(input.sessionId);
      const base = session?.looks.find((look) => look.id === input.lookId);
      if (!session || !base) throw new Error("Styling session or look not found");
      const wantsRed = /red|cherry|coral/i.test(input.changeRequest);
      const updatedItems = wantsRed ? base.items.map((item) => item.category === "bag" ? productCatalog[4] : item) : base.items;
      const updatedLook: Look = { ...base, items: updatedItems, totalCents: total(updatedItems), status: total(updatedItems) <= input.budgetCents ? "ready" : "error", rationale: wantsRed ? "A cherry accent was added while keeping the rest of the edit balanced." : "The edit was adjusted while keeping the original styling direction." };
      const updatedSession = await replaceLookDurable(input.sessionId, updatedLook);
      return { sessionId: input.sessionId, lookId: input.lookId, status: updatedLook.status, refinement: input.changeRequest, updatedLook, session: updatedSession, progress: progress("ready"), budgetPassed: updatedLook.totalCents <= input.budgetCents, note: "The refinement was applied to the look plan and budget check." };
    }),
  }),
  agent: router({
    validateAction: publicProcedure.input(z.object({ action: z.string() })).query(({ input }) => ({ allowed: !isBlocked(input.action) && input.action !== "REQUEST_CHECKOUT_APPROVAL", requiresApproval: input.action === "REQUEST_CHECKOUT_APPROVAL", message: input.action === "REQUEST_CHECKOUT_APPROVAL" ? "User approval is required before checkout." : "Action is allowed within the draft shopping boundary." })),
  }),
  commerce: router({
    refreshAvailability: publicProcedure.input(z.object({ products: z.array(productInput).max(50) })).mutation(async ({ input }) => refreshCloverAvailability(input.products)),
    prepareDraft: publicProcedure.input(z.object({ look: z.object({ id: z.string(), items: z.array(productInput) }) })).mutation(async ({ input }) => {
      const items = input.look.items.map((product) => ({ product, quantity: 1 }));
      const cart: CartState = { id: `cart-${Date.now()}`, lookId: input.look.id, items, totalCents: total(input.look.items), status: "draft" };
      return persistCart(cart);
    }),
    getDraft: publicProcedure.input(z.object({ cartId: z.string() })).query(async ({ input }) => (await getCartDurable(input.cartId)) ?? null),
    updateDraft: publicProcedure.input(z.object({ cartId: z.string(), productId: z.string(), qty: z.number().int().min(0).max(10) })).mutation(async ({ input }) => {
      const cart = await getCartDurable(input.cartId);
      if (!cart) throw new Error("Draft cart not found");
      if (cart.status !== "draft") throw new Error("Only draft carts can be edited");
      if (!cartContainsProduct(cart, input.productId)) throw new Error("Product is not in this draft cart");
      const draft = { id: cart.id || input.cartId, lines: cart.items.map(({ product, quantity }) => ({ productId: product.id, qty: quantity, priceCents: product.owned ? 0 : product.priceCents })), subtotalCents: cart.totalCents, status: "draft" as const };
      const next = cartReducer(draft, { type: "QTY", productId: input.productId, qty: input.qty });
      const items = next.lines.map((line) => { const current = cart.items.find(({ product }) => product.id === line.productId); return current ? { ...current, quantity: line.qty } : null; }).filter((item): item is NonNullable<typeof item> => Boolean(item));
      return persistCart({ ...cart, items, totalCents: next.subtotalCents, status: "draft", approvalExpiresAt: undefined });
    }),
    replacements: publicProcedure.input(z.object({ productId: z.string() })).query(({ input }) => {
      const current = productCatalog.find((product) => product.id === input.productId);
      if (!current) return [];
      return productCatalog.filter((product) => product.id !== current.id && product.category === current.category && !product.owned).slice(0, 3);
    }),
    replaceItem: publicProcedure.input(z.object({ cartId: z.string(), productId: z.string(), replacementId: z.string() })).mutation(async ({ input }) => {
      const cart = await getCartDurable(input.cartId);
      if (!cart) throw new Error("Draft cart not found");
      if (cart.status !== "draft") throw new Error("Only draft carts can be edited");
      if (!cartContainsProduct(cart, input.productId)) throw new Error("Product is not in this draft cart");
      const replacement = productCatalog.find((product) => product.id === input.replacementId && !product.owned);
      if (!replacement) throw new Error("Replacement product is unavailable");
      const items = cart.items.map((item) => item.product.id === input.productId ? { ...item, product: replacement } : item);
      return persistCart({ ...cart, items, totalCents: items.reduce((sum, item) => sum + (item.product.owned ? 0 : item.product.priceCents * item.quantity), 0), approvalExpiresAt: undefined });
    }),
    validateDraft: publicProcedure.input(z.object({ cartId: z.string() })).query(async ({ input }) => {
      const cart = await getCartDurable(input.cartId);
      if (!cart) return { ok: false, warnings: ["Draft cart not found"] };
      const warnings = draftWarnings(cart);
      return { ok: warnings.length === 0, warnings };
    }),
    requestApproval: publicProcedure.input(z.object({ cartId: z.string() })).mutation(async ({ input }) => {
      const cart = await getCartDurable(input.cartId);
      if (!cart) throw new Error("Draft cart not found");
      if (cart.status !== "draft") throw new Error("Only draft carts can request approval");
      const warnings = draftWarnings(cart);
      if (warnings.length) throw new Error(`Draft validation failed: ${warnings.join(" · ")}`);
      const approval = createCartApproval(input.cartId);
      const updated: CartState = { ...cart, status: "awaiting_approval", approvalExpiresAt: approval.expiresAt };
      await persistCart(updated);
      return { cart: updated, approval };
    }),
    reissueApproval: publicProcedure.input(z.object({ cartId: z.string() })).mutation(async ({ input }) => {
      const cart = await getCartDurable(input.cartId);
      if (!cart || cart.status !== "awaiting_approval") throw new Error("Only an awaiting-approval request can be refreshed");
      if (!cart.approvalExpiresAt) throw new Error("Approval timing is unavailable; review the draft and try again");
      const warnings = draftWarnings(cart);
      if (warnings.length) throw new Error(`Draft validation failed: ${warnings.join(" · ")}`);
      const approval = createCartApproval(input.cartId);
      const updated: CartState = { ...cart, approvalExpiresAt: approval.expiresAt };
      await persistCart(updated);
      return { cart: updated, approval };
    }),
    approve: publicProcedure.input(z.object({ cartId: z.string(), token: z.string().uuid() })).mutation(async ({ input }) => {
      const cart = await getCartDurable(input.cartId);
      if (!cart || cart.status !== "awaiting_approval") throw new Error("Approval is invalid or expired");
      const warnings = draftWarnings(cart);
      if (warnings.length) throw new Error(`Approval blocked: ${warnings.join(" · ")}`);
      if (!consumeCartApproval(input.token, input.cartId)) throw new Error("Approval is invalid or expired");
      return persistCart(markCartApproved(cart));
    }),
  }),
  cart: router({
    prepare: publicProcedure.input(z.object({ look: z.object({ id: z.string(), items: z.array(productInput) }) })).mutation(async ({ input }) => { const items = input.look.items.map((product) => ({ product, quantity: 1 })); const cart: CartState = { id: `cart-${Date.now()}`, lookId: input.look.id, items, totalCents: total(input.look.items), status: "draft" }; return persistCart(cart); }),
  }),
});

export type AppRouter = typeof appRouter;
