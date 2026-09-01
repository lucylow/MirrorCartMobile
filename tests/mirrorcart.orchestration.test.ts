import { describe, expect, it } from "vitest";
import { cartContainsProduct, composeLooks, draftWarnings, markCartApproved, total } from "../server/routers";
import { consumeCartApproval, createCartApproval, deleteArchivedSessionDurable, getCart, getCartDurable, listSessionsDurable, purgeExpiredCartApprovals, saveCart, saveSession, updateSessionDurable } from "../server/session-store";
import { parsePersistedCart } from "../server/db";
import { getSessionDurable as getSessionDurableForTest } from "../server/session-store";
import type { Product, StylingIntent, StylingSession } from "../shared/types";
import { userFacingError } from "../lib/utils";
import { isOfflineNetworkState } from "../lib/network-status";
import { getNetworkBannerPresentation } from "../lib/network-banner-policy";
import { getCatalogRefreshStatus } from "../lib/catalog-refresh-status";
import { ARCHIVED_CACHE_MAX_AGE_MS, parseArchivedSessionCache, serializeArchivedSessionCache } from "../lib/archived-cache";
import { formatRelativeTime } from "../lib/relative-time";
import { availabilityFreshness } from "../lib/availability-freshness";
import { availabilityProvenance } from "../lib/availability-provenance";
import { approvalWindow } from "../lib/approval-window";
import { entitlementCopy, hasCapability } from "../shared/entitlements";
import { lookWardrobeRationale, normalizeOwnedProducts, rankProductsByWardrobe, wardrobeFit, wardrobeGaps } from "../lib/wardrobe-personalization";
import { approvalRecoveryAction, approvalRecoveryLabel } from "../lib/approval-recovery";
import { isLatestWardrobeWrite, normalizeRemovedNames, normalizeWardrobePieces, parseWardrobePieces, parseWardrobeSnapshot, serializeWardrobePieces, serializeWardrobeSnapshot, wardrobeFreshness } from "../lib/wardrobe-storage";
import { wardrobePersistenceCopy } from "../lib/wardrobe-persistence";
import { isWardrobeNameRemoved, loadLocalWardrobeContext, mergeOwnedItemNames } from "../lib/wardrobe-context";
import { loadSavedSnapshots, normalizeSavedSnapshotRemovals, parseSavedSnapshotRemovals, parseSavedSnapshots, pruneSavedSnapshotRemovals, SAVED_SNAPSHOT_UNDO_WINDOW_MS, savedSnapshotStatus, serializeSavedSnapshotRemovals, serializeSavedSnapshots } from "../lib/saved-snapshot-cache";
import { refreshCloverAvailability } from "../server/merchant-availability";

const intent = (overrides: Partial<StylingIntent> = {}): StylingIntent => ({ mode: "occasion", request: "date night", occasion: "date night", aesthetic: "chic", budgetCents: 18_000, ownedItems: [], ...overrides });

describe("MirrorCart orchestration helpers", () => {
  it("uses demo availability when merchant credentials are absent", async () => {
    const previousToken = process.env.CLOVER_API_TOKEN;
    const previousMerchant = process.env.CLOVER_MERCHANT_ID;
    delete process.env.CLOVER_API_TOKEN;
    delete process.env.CLOVER_MERCHANT_ID;
    const product = { id: "shoe-001", name: "Sculpted Kitten Heel", brand: "Nola", category: "shoes", priceCents: 1200, imageUrl: "https://example.com/shoe.jpg", merchantUrl: "https://example.com", color: "black", availability: "in_stock" } as Product;
    const result = await refreshCloverAvailability([product]);
    expect(result.mode).toBe("demo");
    expect(result.items[0].dataSource).toBe("seed");
    process.env.CLOVER_API_TOKEN = previousToken;
    process.env.CLOVER_MERCHANT_ID = previousMerchant;
  });

  it("maps Clover stock quantities into approval-aware availability", async () => {
    const previousToken = process.env.CLOVER_API_TOKEN;
    const previousMerchant = process.env.CLOVER_MERCHANT_ID;
    process.env.CLOVER_API_TOKEN = "test-token";
    process.env.CLOVER_MERCHANT_ID = "merchant-1";
    const product = { id: "shoe-001", name: "Sculpted Kitten Heel", brand: "Nola", category: "shoes", priceCents: 1200, imageUrl: "https://example.com/shoe.jpg", merchantUrl: "https://example.com", color: "black" } as Product;
    const fetcher: typeof fetch = async () => new Response(JSON.stringify({ elements: [{ id: "shoe-001", itemStock: { quantity: 2 } }] }), { status: 200, headers: { "content-type": "application/json" } });
    const result = await refreshCloverAvailability([product], fetcher);
    expect(result.mode).toBe("live");
    expect(result.items[0].availability).toBe("limited");
    expect(result.items[0].dataSource).toBe("api");
    process.env.CLOVER_API_TOKEN = previousToken;
    process.env.CLOVER_MERCHANT_ID = previousMerchant;
  });

  it("fails closed when the live merchant refresh is unavailable", async () => {
    const previousToken = process.env.CLOVER_API_TOKEN;
    const previousMerchant = process.env.CLOVER_MERCHANT_ID;
    process.env.CLOVER_API_TOKEN = "test-token";
    process.env.CLOVER_MERCHANT_ID = "merchant-1";
    const product = { id: "shoe-001", name: "Sculpted Kitten Heel", brand: "Nola", category: "shoes", priceCents: 1200, imageUrl: "https://example.com/shoe.jpg", merchantUrl: "https://example.com", color: "black" } as Product;
    const result = await refreshCloverAvailability([product], async () => new Response("no", { status: 503 }));
    expect(result.mode).toBe("unavailable");
    expect(result.items[0].availability).toBe("unknown");
    expect(result.items[0].dataSource).toBe("cache");
    process.env.CLOVER_API_TOKEN = previousToken;
    process.env.CLOVER_MERCHANT_ID = previousMerchant;
  });

  it("calculates totals from item prices", () => {
    const items = [{ priceCents: 1200 }, { priceCents: 3400 }] as Product[];
    expect(total(items)).toBe(4600);
  });

  it("preserves owned black heels as a zero-cost item", () => {
    const looks = composeLooks(intent({ ownedItems: ["black heels"] }));
    expect(looks[0].items.some((item) => item.owned && item.category === "shoes")).toBe(true);
    expect(looks[0].totalCents).toBeLessThan(18_000);
  });

  it("uses wardrobe-aware ordering for closet missions", () => {
    const looks = composeLooks(intent({ mode: "closet", ownedItems: ["black heels"] }));
    expect(looks.slice(0, 2).map((look) => look.id)).toEqual(["look-01", "look-02"]);
    expect(looks[2].id).toBe("look-03");
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

describe("MirrorCart availability provenance", () => {
  const product = (overrides: Partial<Product> = {}) => ({ id: "p-1", name: "Test", brand: "Test", category: "top" as const, priceCents: 1000, imageUrl: "https://example.com/p.jpg", merchantUrl: "https://example.com", color: "ink", ...overrides });

  it("marks timestamped API data as live and approval-trusted", () => {
    expect(availabilityProvenance(product({ dataSource: "api", lastCheckedAt: "2026-08-25T12:00:00.000Z" }))).toEqual({ label: "Live merchant check", accessibilityLabel: "Live merchant check", trustedForApproval: true });
  });

  it("does not treat cached data as approval-trusted", () => {
    const result = availabilityProvenance(product({ dataSource: "cache", lastCheckedAt: "2026-08-25T12:00:00.000Z" }));
    expect(result.trustedForApproval).toBe(false);
    expect(result.accessibilityLabel).toContain("Confirm with the merchant");
  });

  it("labels seed data as demo availability", () => {
    expect(availabilityProvenance(product({ dataSource: "seed" })).label).toContain("Demo availability");
  });

  it("requires merchant confirmation for missing provenance", () => {
    expect(availabilityProvenance(product()).label).toBe("Availability not verified");
  });
});

describe("MirrorCart approval-window presentation", () => {
  const now = Date.parse("2026-08-25T12:00:00.000Z");

  it("shows remaining minutes for an active approval", () => {
    expect(approvalWindow("2026-08-25T12:03:01.000Z", now).label).toBe("Approval active · about 4 minutes left");
  });

  it("uses seconds copy near expiry", () => {
    expect(approvalWindow("2026-08-25T12:00:45.000Z", now).label).toBe("Approval active · about 45 seconds left");
  });

  it("uses singular minute copy above the seconds boundary", () => {
    expect(approvalWindow("2026-08-25T12:01:01.000Z", now).label).toBe("Approval active · about 2 minutes left");
  });

  it("marks elapsed approval windows as expired", () => {
    expect(approvalWindow("2026-08-25T11:59:59.000Z", now).expired).toBe(true);
  });

  it("avoids false timing claims for invalid or missing expiry values", () => {
    expect(approvalWindow("not-a-date", now).label).toBe("Approval window unavailable");
    expect(approvalWindow(undefined, now).label).toBe("Approval window unavailable");
  });
});

describe("MirrorCart wardrobe storage", () => {
  it("parses valid pieces, removes duplicates, and fails closed", () => {
    const raw = JSON.stringify([{ id: "top", name: "Silk top", createdAt: "2026-08-25T00:00:00.000Z" }, { id: "top", name: "Duplicate", createdAt: "" }, null, { id: "bad", name: "" }]);
    expect(parseWardrobePieces(raw)).toEqual([{ id: "top", name: "Silk top", createdAt: "2026-08-25T00:00:00.000Z" }]);
    expect(parseWardrobePieces("not-json")).toEqual([]);
    expect(normalizeWardrobePieces(undefined)).toEqual([]);
  });

  it("serializes a normalized local snapshot", () => {
    expect(serializeWardrobePieces([{ id: "top", name: " Silk top ", createdAt: "" }, { id: "top", name: "Duplicate", createdAt: "" }])).toBe(JSON.stringify([{ id: "top", name: "Silk top", createdAt: "" }]));
  });

  it("communicates persistence lifecycle states accessibly", () => {
    expect(wardrobePersistenceCopy("saving").label).toContain("Saving");
    expect(wardrobePersistenceCopy("unavailable").accessibilityLabel).toContain("unavailable");
    expect(wardrobePersistenceCopy("saved").label).toBe("Saved on this device");
  });

  it("merges manual and local wardrobe context without duplicates", () => {
    expect(mergeOwnedItemNames("Black heels", [{ id: "1", name: "black heels", createdAt: "" }, { id: "2", name: "Silk top", createdAt: "" }])).toEqual(["Black heels", "Silk top"]);
  });

  it("keeps removed local pieces out of styling context without overriding manual intent", () => {
    expect(mergeOwnedItemNames("I already own black heels", [{ id: "1", name: "Black heels", createdAt: "" }, { id: "2", name: "Silk top", createdAt: "" }], [" black heels "])).toEqual(["I already own black heels", "Silk top"]);
    expect(mergeOwnedItemNames("", [{ id: "1", name: "Black heels", createdAt: "" }], ["BLACK HEELS"])).toEqual([]);
  });

  it("formats local wardrobe freshness defensively", () => {
    const now = Date.parse("2026-08-25T12:00:00.000Z");
    expect(wardrobeFreshness("2026-08-25T11:59:30.000Z", now).label).toBe("Updated just now");
    expect(wardrobeFreshness("2026-08-25T11:00:00.000Z", now).label).toBe("Updated 1h ago");
    expect(wardrobeFreshness("invalid", now).label).toBe("Local wardrobe age unavailable");
    expect(isLatestWardrobeWrite(2, 2)).toBe(true);
    expect(isLatestWardrobeWrite(1, 2)).toBe(false);
    expect(parseWardrobeSnapshot(serializeWardrobeSnapshot([{ id: "top", name: "Silk top", createdAt: "" }], "2026-08-25T12:00:00.000Z")).savedAt).toBe("2026-08-25T12:00:00.000Z");
  });

  it("keeps removal tombstones normalized and case-insensitive", () => {
    expect(normalizeRemovedNames([" Black heels ", "black heels", null])).toEqual(["Black heels"]);
    expect(isWardrobeNameRemoved("BLACK HEELS", ["Black heels"])).toBe(true);
    expect(isWardrobeNameRemoved("Silk top", ["Black heels"])).toBe(false);
  });

  it("loads local context safely from valid, malformed, and failed storage reads", async () => {
    expect(parseWardrobeSnapshot(JSON.stringify({ pieces: [{ id: "1", name: "Silk top", createdAt: "" }], savedAt: "2026-08-25T12:00:00.000Z", removedNames: ["Black heels"] })).removedNames).toEqual(["Black heels"]);
    expect(parseWardrobeSnapshot(JSON.stringify({ pieces: [{ id: "1", name: "Silk top", createdAt: "" }], savedAt: "2026-08-25T12:00:00.000Z" })).savedAt).toBe("2026-08-25T12:00:00.000Z");
    expect(await loadLocalWardrobeContext(async () => JSON.stringify([{ id: "1", name: "Silk top", createdAt: "" }]))).toEqual({ pieces: [{ id: "1", name: "Silk top", createdAt: "" }], savedAt: undefined, removedNames: [], available: true });
    expect(await loadLocalWardrobeContext(async () => "malformed")).toEqual({ pieces: [], savedAt: undefined, removedNames: [], available: true });
    expect(await loadLocalWardrobeContext(async () => { throw new Error("storage unavailable"); })).toEqual({ pieces: [], savedAt: undefined, removedNames: [], available: false });
  });
});

describe("MirrorCart saved snapshot cache", () => {
  const session = { id: "session-1", intent: intent({ occasion: "date night" }), looks: [], progress: [], status: "ready" } as StylingSession;

  it("normalizes and serializes valid snapshots while ignoring malformed cache data", async () => {
    expect(parseSavedSnapshots(JSON.stringify([session, session, null]))).toHaveLength(1);
    expect(parseSavedSnapshots("not-json")).toEqual([]);
    expect(parseSavedSnapshots(serializeSavedSnapshots([session]))[0].id).toBe("session-1");
    expect(normalizeSavedSnapshotRemovals([" session-1 ", "session-1", null])).toEqual(["session-1"]);
    expect(parseSavedSnapshotRemovals(serializeSavedSnapshotRemovals(["session-1"]))).toEqual(["session-1"]);
    expect(parseSavedSnapshotRemovals("not-json")).toEqual([]);
    expect(pruneSavedSnapshotRemovals(["session-1", "stale"], [session])).toEqual(["session-1"]);
    expect(pruneSavedSnapshotRemovals(["session-1"], [])).toEqual(["session-1"]);
    expect(await loadSavedSnapshots(async () => serializeSavedSnapshots([session]))).toHaveLength(1);
    expect(await loadSavedSnapshots(async () => { throw new Error("storage unavailable"); })).toEqual([]);
  });

  it("keeps the undo affordance bounded to a short recovery window", () => {
    expect(SAVED_SNAPSHOT_UNDO_WINDOW_MS).toBe(8_000);
  });

  it("describes whether snapshots are synced or recovered locally", () => {
    expect(savedSnapshotStatus(true, false, true)).toBe("Synced from recent edits");
    expect(savedSnapshotStatus(false, true, true)).toBe("Showing saved snapshots from this device");
    expect(savedSnapshotStatus(false, true, false)).toBe("Recent edits are unavailable");
  });
});

describe("MirrorCart wardrobe personalization", () => {
  const ownedTop: Product = { id: "owned-top", name: "Top", brand: "Mirror", category: "top", priceCents: 0, imageUrl: "", merchantUrl: "", color: "black", owned: true };
  const newShoes: Product = { id: "new-shoes", name: "Shoes", brand: "Mirror", category: "shoes", priceCents: 9_000, imageUrl: "", merchantUrl: "", color: "black" };

  it("identifies categories not represented by owned pieces", () => {
    expect(wardrobeGaps([ownedTop])).toContain("shoes");
    expect(wardrobeGaps([ownedTop])).not.toContain("top");
  });

  it("distinguishes wardrobe updates from genuine gaps", () => {
    expect(wardrobeFit(ownedTop, [ownedTop]).label).toBe("Already in your wardrobe");
    expect(wardrobeFit({ ...ownedTop, owned: false }, [ownedTop]).label).toContain("category you own");
    expect(wardrobeFit(newShoes, [ownedTop]).label).toBe("Fills a wardrobe gap");
  });

  it("ranks wardrobe gaps first while preserving ties", () => {
    const update = { ...ownedTop, id: "update-top", owned: false };
    const secondGap = { ...newShoes, id: "second-gap" };
    expect(rankProductsByWardrobe([update, secondGap], [ownedTop]).map((product) => product.id)).toEqual(["second-gap", "update-top"]);
    expect(rankProductsByWardrobe([secondGap, { ...newShoes, id: "third-gap" }], [ownedTop]).map((product) => product.id)).toEqual(["second-gap", "third-gap"]);
  });

  it("explains why a look fits the wardrobe", () => {
    expect(lookWardrobeRationale([ownedTop], [ownedTop])).toBe("Built entirely from your wardrobe");
    expect(lookWardrobeRationale([ownedTop, newShoes], [ownedTop])).toBe("Adds a piece from a wardrobe gap");
    expect(lookWardrobeRationale([ownedTop, { ...ownedTop, id: "fresh-top", owned: false }], [ownedTop])).toBe("Uses a piece you already own");
    expect(lookWardrobeRationale([{ ...newShoes, id: "fresh-shoes" }], [])).toBe("A fresh edit for your current brief");
  });

  it("fails closed for malformed wardrobe payloads", () => {
    expect(normalizeOwnedProducts([null, { id: "bad", category: "not-a-category", owned: true }, { id: "valid", category: "top", owned: true }])).toHaveLength(1);
    expect(wardrobeGaps(null)).toEqual(["dress", "top", "bottom", "shoes", "bag", "accessory"]);
    expect(lookWardrobeRationale([newShoes], { malformed: true })).toBe("A fresh edit for your current brief");
  });
});

describe("MirrorCart entitlement policy", () => {
  it("allows capabilities only for usable entitlement states", () => {
    expect(hasCapability({ status: "active", capabilities: ["premium_vto"] }, "premium_vto")).toBe(true);
    expect(hasCapability({ status: "grace", capabilities: ["premium_vto"] }, "premium_vto")).toBe(true);
    expect(hasCapability({ status: "paused", capabilities: ["premium_vto"] }, "premium_vto")).toBe(true);
    expect(hasCapability({ status: "expired", capabilities: ["premium_vto"] }, "premium_vto")).toBe(false);
    expect(hasCapability(undefined, "premium_vto")).toBe(false);
  });

  it("keeps entitlement status copy explicit", () => {
    expect(entitlementCopy({ status: "active", capabilities: [] })).toBe("Premium access active.");
    expect(entitlementCopy({ status: "grace", capabilities: [] })).toContain("billing is resolved");
    expect(entitlementCopy({ status: "unknown", capabilities: [] })).toContain("status unavailable");
  });
});

describe("MirrorCart approval lifecycle", () => {
  it("invalidates the previous token when approval is restored", () => {
    const first = createCartApproval("cart-lifecycle");
    const second = createCartApproval("cart-lifecycle");
    expect(second.token).not.toBe(first.token);
    expect(consumeCartApproval(first.token, "cart-lifecycle")).toBe(false);
    expect(consumeCartApproval(second.token, "cart-lifecycle")).toBe(true);
    expect(consumeCartApproval(second.token, "cart-lifecycle")).toBe(false);
  });
});

describe("MirrorCart approval recovery", () => {
  it("requests approval for a draft cart", () => {
    expect(approvalRecoveryAction("draft", false, false)).toBe("request");
    expect(approvalRecoveryLabel("request")).toBe("Request approval");
  });

  it("approves an active awaiting-approval cart with a token", () => {
    expect(approvalRecoveryAction("awaiting_approval", true, false)).toBe("approve");
    expect(approvalRecoveryLabel("approve")).toBe("Approve this draft");
  });

  it("restores approval when the token is missing or expired", () => {
    expect(approvalRecoveryAction("awaiting_approval", false, false)).toBe("restore");
    expect(approvalRecoveryAction("awaiting_approval", true, true)).toBe("restore");
    expect(approvalRecoveryLabel("restore")).toBe("Restore approval");
  });
});

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

  it("clears approval expiry metadata after human approval", () => {
    const cart = { id: "cart-approved", lookId: "look-1", status: "awaiting_approval" as const, approvalExpiresAt: "2026-08-25T12:00:00.000Z", totalCents: 1000, items: [] };
    const approved = markCartApproved(cart);
    expect(approved.status).toBe("approved");
    expect(approved.approvalExpiresAt).toBeUndefined();
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

  it("formats Cart item availability freshness with stable accessible copy", () => {
    const now = Date.parse("2026-08-25T00:00:00.000Z");
    expect(availabilityFreshness("2026-08-24T23:55:00.000Z", now)).toEqual({
      label: "Availability checked 5 minutes ago",
      accessibilityLabel: "Availability checked 5 minutes ago",
      known: true,
    });
    expect(availabilityFreshness("not-a-date", now)).toEqual({
      label: "Availability not checked",
      accessibilityLabel: "Availability not checked",
      known: false,
    });
    expect(availabilityFreshness(undefined, now).known).toBe(false);
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
