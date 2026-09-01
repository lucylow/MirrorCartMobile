import { randomUUID } from "node:crypto";
import type { CartState, Look, StylingSession } from "../shared/types";
import { deleteStylingSession, listStylingSessions, loadPreparedCart, loadStylingSession, savePreparedCart, saveStylingSession } from "./db";

const sessions = new Map<string, StylingSession>();
const carts = new Map<string, CartState>();
const approvals = new Map<string, { token: string; cartId: string; expiresAt: string }>();

export function saveSession(session: StylingSession) {
  sessions.set(session.id, session);
  return session;
}

export async function persistSession(session: StylingSession) {
  saveSession(session);
  try { await saveStylingSession(session); } catch { /* Keep the in-memory session available during transient DB outages. */ }
  return session;
}

export async function listSessionsDurable(limit = 8) {
  let durable: StylingSession[] = [];
  try { durable = await listStylingSessions(limit); } catch { /* Use the local cache when the database is temporarily unavailable. */ }
  const merged = new Map(durable.map((session) => [session.id, session]));
  for (const session of sessions.values()) merged.set(session.id, session);
  return [...merged.values()].sort((a, b) => b.id.localeCompare(a.id)).slice(0, limit);
}

export async function getSessionDurable(sessionId: string) {
  const local = sessions.get(sessionId);
  if (local) return local;
  try {
    const durable = await loadStylingSession(sessionId);
    if (durable) sessions.set(sessionId, durable);
    return durable;
  } catch { return undefined; }
}

export async function deleteArchivedSessionDurable(sessionId: string) {
  const current = await getSessionDurable(sessionId);
  if (!current || !current.archivedAt) return false;
  try {
    await deleteStylingSession(sessionId);
    sessions.delete(sessionId);
    return true;
  } catch {
    return false;
  }
}

export async function updateSessionDurable(sessionId: string, patch: Partial<StylingSession>) {
  const current = await getSessionDurable(sessionId);
  if (!current) return undefined;
  const updated = saveSession({ ...current, ...patch });
  try { await saveStylingSession(updated); } catch { /* Return the updated local copy during a transient DB outage. */ }
  return updated;
}

export async function replaceLookDurable(sessionId: string, look: Look) {
  const current = await getSessionDurable(sessionId);
  if (!current) return undefined;
  const updated = saveSession({ ...current, looks: current.looks.map((item) => item.id === look.id ? look : item), selectedLookId: look.id, status: "ready" as const });
  try { await saveStylingSession(updated); } catch { /* Keep the refinement available locally during a transient DB outage. */ }
  return updated;
}

export function saveCart(cart: CartState) {
  carts.set(cart.lookId, cart);
  if (cart.id) carts.set(cart.id, cart);
  return cart;
}

export async function persistCart(cart: CartState) {
  saveCart(cart);
  try { await savePreparedCart(cart); } catch { /* Keep the cart usable during a transient DB outage. */ }
  return cart;
}

export function getCart(identifier: string) {
  const direct = carts.get(identifier);
  if (direct) return direct;
  for (const cart of carts.values()) if (cart.id === identifier || cart.lookId === identifier) return cart;
  return undefined;
}

export async function getCartDurable(cartId: string) {
  const local = getCart(cartId);
  if (local) return local;
  try {
    const durable = await loadPreparedCart(cartId);
    if (durable) saveCart(durable);
    return durable;
  } catch { return undefined; }
}

export function purgeExpiredCartApprovals(now = Date.now()) {
  for (const [token, approval] of approvals.entries()) if (Date.parse(approval.expiresAt) <= now) approvals.delete(token);
}

export function createCartApproval(cartId: string) {
  purgeExpiredCartApprovals();
  for (const [token, approval] of approvals.entries()) if (approval.cartId === cartId) approvals.delete(token);
  const approval = { token: randomUUID(), cartId, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() };
  approvals.set(approval.token, approval);
  return approval;
}

export function consumeCartApproval(token: string, cartId: string) {
  purgeExpiredCartApprovals();
  const approval = approvals.get(token);
  if (!approval || approval.cartId !== cartId || Date.parse(approval.expiresAt) <= Date.now()) return false;
  approvals.delete(token);
  return true;
}
