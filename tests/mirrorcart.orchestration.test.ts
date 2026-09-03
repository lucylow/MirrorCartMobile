import { describe, expect, it } from "vitest";
import { cartContainsProduct, composeLooks, draftWarnings, total } from "../server/routers";
import { consumeCartApproval, createCartApproval, deleteArchivedSessionDurable, getCart, getCartDurable, listSessionsDurable, purgeExpiredCartApprovals, saveCart, saveSession, updateSessionDurable } from "../server/session-store";
import { parsePersistedCart } from "../server/db";
import { getSessionDurable as getSessionDurableForTest } from "../server/session-store";
import type { Product, StylingIntent } from "../shared/types";
import { userFacingError } from "../lib/utils";
import { isOfflineNetworkState } from "../lib/network-status";
import { getNetworkBannerPresentation } from "../lib/network-banner-policy";
import { getCatalogRefreshStatus } from "../lib/catalog-refresh-status";
import { ARCHIVED_CACHE_MAX_AGE_MS, parseArchivedSessionCache, serializeArchivedSessionCache } from "../lib/archived-cache";
import { formatRelativeTime } from "../lib/relative-time";

const intent = (overrides: Partial<StylingIntent> = {}): StylingIntent => ({ mode: "occasion", request: "date night", occasion: "date night", aesthetic: "chic", budgetCents: 18_000, ownedItems: [], ...overrides });

describe("MirrorCart orchestration helpers", () => {
  it("calculates totals from item prices", () => {
    const items = [{ priceCents: 1200 }, { priceCents: 3400 }] as Product[];
    expect(total(items)).toBe(4600);
  });

  it("preserves owned black heels as a zero-cost item", () => {
    const looks = composeLooks(intent({ ownedItems: ["black heels"] }));
    expect(looks[0].items.some((item) => item.owned && item.category === "shoes")).toBe(true);
    expect(looks[0].totalCents).toBeLessThan(18_000);
  });

  it("marks a look as over budget when hard constraints fail", () => {
    const looks = composeLooks(intent({ budgetCents: 100 }));
    expect(looks.every((look) => look.status === "error")).toBe(true);
  });
});

import { MockVtoProvider, normalizeStatus } from "../server/vto";

describe("MirrorCart VTO provider boundary", () => {
  it("normalizes provider lifecycle statuses", () => {
    expect(normalizeStatus("success")).toBe("ready");
    expect(normalizeStatus("processing")).toBe("processing");
    expect(normalizeStatus("failed")).toBe("error");
    expect(normalizeStatus("unknown")).toBe("queued");
  });

  it("returns a ready mock result without provider credentials", async () => {
    const provider = new MockVtoProvider();
    const result = await provider.createTask({ userImageUrl: "https://example.com/user.jpg", look: { id: "look-1", title: "Test", subtitle: "Test", rationale: "Test", items: [], totalCents: 0, status: "draft" } });
    expect(result.provider).toBe("mock");
    expect(result.status).toBe("ready");
    expect(result.taskId).toContain("mock-task");
  });
});

import { canExecute, cartReducer, groundProduct, isBlocked } from "../shared/agentic";
import { sourceLabel } from "../shared/data-source";
import { availabilityCopy, hydrateCatalog, isProductFresh } from "../shared/catalog";

describe("MirrorCart error presentation", () => {
  it("falls back for unexpected technical errors", () => {
    expect(userFacingError(new Error("ECONNREFUSED 127.0.0.1:3000"), "Try again shortly.")).toBe("Try again shortly.");
  });
  it("preserves actionable domain errors", () => {
    expect(userFacingError(new Error("This draft exceeds the budget."), "Try again shortly.")).toContain("budget");
  });
  it("keeps long actionable errors readable", () => {
    const message = `Approval blocked: ${"inventory detail ".repeat(30)}`;
    const result = userFacingError(new Error(message), "Try again shortly.");
    expect(result.length).toBe(180);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("MirrorCart commerce safety contracts", () => {
  it("merges repeated draft-cart additions and recomputes subtotal", () => {
    const base = { id: "cart-1", lines: [{ productId: "dress-001", qty: 1, priceCents: 8900 }], subtotalCents: 8900, status: "draft" as const };
    const next = cartReducer(base, { type: "ADD", line: { productId: "dress-001", qty: 2, priceCents: 8900 } });
    expect(next.lines[0].qty).toBe(3);
    expect(next.subtotalCents).toBe(26700);
  });

  it("grounds missing availability as unknown instead of inventing stock", () => {
    const grounded = groundProduct({ id: "p-1", name: "Test", brand: "Test", category: "top", priceCents: 1000, imageUrl: "https://example.com/p.jpg", merchantUrl: "https://example.com", color: "ink" });
    expect(grounded.availability).toBe("unknown");
    expect(grounded.productUrl).toBe("https://example.com");
  });

  it("labels the offline catalog as demo data", () => {
    expect(sourceLabel("seed")).toBe("Demo catalog");
  });

  it("prefers live catalog data, then cache, then seed", () => {
    const seed = { items: [], source: "seed" as const, fetchedAt: "2026-01-01T00:00:00.000Z" };
    const cached = { items: [{ id: "cached" }] as Product[], source: "cache" as const, fetchedAt: "2026-01-02T00:00:00.000Z" };
    const hydrated = hydrateCatalog(undefined, cached, seed);
    expect(hydrated.source).toBe("cache");
    expect(availabilityCopy({ id: "p", name: "P", brand: "B", category: "top", priceCents: 1, imageUrl: "https://example.com/p.jpg", merchantUrl: "https://example.com", color: "ink", availability: "unknown" })).toContain("Confirm");
    expect(isProductFresh({ id: "p", name: "P", brand: "B", category: "top", priceCents: 1, imageUrl: "https://example.com/p.jpg", merchantUrl: "https://example.com", color: "ink", lastCheckedAt: "2026-01-01T00:00:00.000Z" }, Date.parse("2026-01-01T00:05:00.000Z"))).toBe(true);
  });

  it("blocks autonomous approval and purchase claims", () => {
    expect(canExecute({ type: "REQUEST_CHECKOUT_APPROVAL", cartId: "cart-1" })).toBe(false);
    expect(isBlocked("purchase_without_approval")).toBe(true);
    expect(isBlocked("claim_order_paid")).toBe(true);
  });

  it("blocks approval warnings for unknown or unavailable inventory", () => {
    const cart = { id: "cart-1", lookId: "look-1", status: "draft" as const, totalCents: 1000, items: [{ quantity: 1, product: { id: "p-1", name: "Test", brand: "Test", category: "top" as const, priceCents: 1000, imageUrl: "https://example.com/p.jpg", merchantUrl: "https://example.com", color: "ink", availability: "unknown" as const } }] };
    expect(draftWarnings(cart)).toHaveLength(1);
    expect(draftWarnings(cart)[0]).toContain("Confirm");
  });

  it("recognizes only products that exist in a draft cart", () => {
    const cart = { id: "cart-1", lookId: "look-1", status: "draft" as const, totalCents: 0, items: [] };
    expect(cartContainsProduct(cart, "missing-product")).toBe(false);
  });

  it("purges expired approval tokens while keeping valid approvals usable", () => {
    const approval = createCartApproval("cart-expiry");
    purgeExpiredCartApprovals(Date.parse(approval.expiresAt) + 1);
    expect(consumeCartApproval(approval.token, "cart-expiry")).toBe(false);

    const valid = createCartApproval("cart-valid");
    expect(consumeCartApproval(valid.token, "cart-valid")).toBe(true);
  });

  it("invalidates older approval tokens for the same cart", () => {
    const first = createCartApproval("cart-token-test");
    const second = createCartApproval("cart-token-test");
    expect(consumeCartApproval(first.token, "cart-token-test")).toBe(false);
    expect(consumeCartApproval(second.token, "cart-token-test")).toBe(true);
  });

  it("resolves cached carts by either cart ID or look ID", async () => {
    const cart = { id: "cart-lookup-test", lookId: "look-lookup-test", status: "draft" as const, totalCents: 0, items: [] };
    saveCart(cart);
    expect(getCart("cart-lookup-test")).toBe(cart);
    expect(getCart("look-lookup-test")).toBe(cart);
    await expect(getCartDurable("look-lookup-test")).resolves.toBe(cart);
  });
  it("deletes only archived sessions and preserves active sessions", async () => {
    const active = { id: "session-active-delete-test", status: "ready" as const, progress: [], looks: [], intent: { mode: "occasion" as const, request: "test look", occasion: "test", aesthetic: "test", budgetCents: 1000, ownedItems: [] } };
    saveSession(active);
    expect(await deleteArchivedSessionDurable(active.id)).toBe(false);
    expect(await getSessionDurableForTest(active.id)).toBe(active);

    const archived = { ...active, id: "session-archived-delete-test", archivedAt: new Date().toISOString() };
    saveSession(archived);
    expect(await deleteArchivedSessionDurable(archived.id)).toBe(true);
    expect(await getSessionDurableForTest(archived.id)).toBeUndefined();
  });

  it("round-trips archive, filtered listing, restore, and delete preconditions", async () => {
    const session = { id: "session-archive-roundtrip-test", status: "ready" as const, progress: [], looks: [], intent: { mode: "occasion" as const, request: "round trip", occasion: "round trip", aesthetic: "test", budgetCents: 1000, ownedItems: [] } };
    saveSession(session);
    const archived = await updateSessionDurable(session.id, { archivedAt: new Date().toISOString() });
    expect(archived?.archivedAt).toBeTruthy();
    expect((await listSessionsDurable(20)).some((item) => item.id === session.id && item.archivedAt)).toBe(true);
    const restored = await updateSessionDurable(session.id, { archivedAt: undefined });
    expect(restored?.archivedAt).toBeUndefined();
    expect(await deleteArchivedSessionDurable(session.id)).toBe(false);
  });

  it("hydrates only valid archived sessions from the local cache", () => {
    const valid = { id: "session-cached", archivedAt: "2026-08-01T00:00:00.000Z", intent: { mode: "occasion", request: "cached look" }, looks: [] };
    const active = { id: "session-active", intent: { mode: "occasion", request: "active look" }, looks: [] };
    expect(parseArchivedSessionCache(JSON.stringify([valid, active, { id: "broken" }, "invalid"]))).toEqual([valid]);
    expect(parseArchivedSessionCache("not-json")).toEqual([]);
  });

  it("expires versioned archive caches without accepting future timestamps", () => {
    const now = Date.parse("2026-08-24T00:00:00.000Z");
    const session = { id: "session-fresh", archivedAt: "2026-08-23T00:00:00.000Z", status: "ready" as const, progress: [], intent: { mode: "occasion" as const, request: "fresh look", occasion: "fresh", aesthetic: "test", budgetCents: 1000, ownedItems: [] }, looks: [] };
    expect(parseArchivedSessionCache(serializeArchivedSessionCache([session], now - ARCHIVED_CACHE_MAX_AGE_MS + 1), now)).toEqual([session]);
    expect(parseArchivedSessionCache(serializeArchivedSessionCache([session], now - ARCHIVED_CACHE_MAX_AGE_MS - 1), now)).toEqual([]);
    expect(parseArchivedSessionCache(serializeArchivedSessionCache([session], now + 1), now)).toEqual([]);
  });

  it("shows catalog refresh status only for active reachable queries", () => {
    expect(getCatalogRefreshStatus(1, true)).toMatchObject({ visible: true, label: "Refreshing live catalog and inventory" });
    expect(getCatalogRefreshStatus(0, true).visible).toBe(false);
    expect(getCatalogRefreshStatus(1, false).visible).toBe(false);
    expect(getCatalogRefreshStatus(1, undefined).visible).toBe(false);
  });

  it("keeps offline banner presentation explicit and stable", () => {
    const offline = getNetworkBannerPresentation({ isConnected: false, isInternetReachable: false });
    expect(offline.visible).toBe(true);
    expect(offline.title).toBe("Offline mode");
    expect(offline.message).toContain("approval requests are paused");
    expect(offline.accessibilityLabel).toContain("Offline mode");

    const reconnected = getNetworkBannerPresentation({ isConnected: true, isInternetReachable: true }, true);
    expect(reconnected).toMatchObject({ visible: true, kind: "reconnected", title: "Back online" });
    expect(reconnected.message).toContain("Refreshing live catalog and inventory data");
    const refreshed = getNetworkBannerPresentation({ isConnected: true, isInternetReachable: true }, true, true);
    expect(refreshed.message).toContain("up to date");
    expect(refreshed.accessibilityLabel).toContain("up to date");
    expect(getNetworkBannerPresentation({ isConnected: true, isInternetReachable: true }).visible).toBe(false);
    expect(getNetworkBannerPresentation({ isConnected: undefined, isInternetReachable: undefined }, true).visible).toBe(false);
  });

  it("formats local archive freshness with stable relative copy", () => {
    const now = Date.parse("2026-08-25T00:00:00.000Z");
    expect(formatRelativeTime("not-a-date", now)).toBe("unknown time");
    expect(formatRelativeTime("2026-08-24T23:59:45.000Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-08-24T23:55:00.000Z", now)).toBe("5 minutes ago");
    expect(formatRelativeTime("2026-08-24T22:00:00.000Z", now)).toBe("2 hours ago");
    expect(formatRelativeTime("2026-08-22T00:00:00.000Z", now)).toBe("3 days ago");
    expect(formatRelativeTime("2026-07-25T00:00:00.000Z", now)).toBe("1 month ago");
  });

  it("treats only explicit network failures as offline", () => {
    expect(isOfflineNetworkState({ isConnected: false, isInternetReachable: false })).toBe(true);
    expect(isOfflineNetworkState({ isConnected: true, isInternetReachable: false })).toBe(true);
    expect(isOfflineNetworkState({ isConnected: true, isInternetReachable: true })).toBe(false);
    expect(isOfflineNetworkState({ isConnected: undefined, isInternetReachable: undefined })).toBe(false);
  });

  it("parses only structurally valid persisted carts", () => {
    expect(parsePersistedCart("not-json")).toBeUndefined();
    expect(parsePersistedCart(JSON.stringify({ id: "cart-1", lookId: "look-1", items: [], totalCents: 0, status: "draft" }))).toMatchObject({ id: "cart-1", lookId: "look-1" });
    expect(parsePersistedCart(JSON.stringify({ id: "cart-1", items: [] }))).toBeUndefined();
  });
});
