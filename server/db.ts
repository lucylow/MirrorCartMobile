import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { preparedCarts, stylingSessions, type InsertUser, users } from "../drizzle/schema";
import type { CartState, StylingSession } from "../shared/types";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) { values.role = user.role ?? "admin"; updateSet.role = values.role; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function sessionFromRow(row: typeof stylingSessions.$inferSelect): StylingSession {
  return {
    id: row.id,
    intent: JSON.parse(row.intentJson),
    photoUri: row.photoUri ?? undefined,
    status: row.status as StylingSession["status"],
    progress: JSON.parse(row.progressJson),
    looks: JSON.parse(row.looksJson),
    selectedLookId: row.selectedLookId ?? undefined,
    vtoTaskId: row.vtoTaskId ?? undefined,
    vtoProvider: (row.vtoProvider as StylingSession["vtoProvider"]) ?? undefined,
    vtoPreviewUrl: row.vtoPreviewUrl ?? undefined,
    archivedAt: row.archivedAt ? row.archivedAt.toISOString() : undefined,
  };
}

export async function saveStylingSession(session: StylingSession): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = { id: session.id, intentJson: JSON.stringify(session.intent), photoUri: session.photoUri ?? null, status: session.status, progressJson: JSON.stringify(session.progress), looksJson: JSON.stringify(session.looks), selectedLookId: session.selectedLookId ?? null, vtoTaskId: session.vtoTaskId ?? null, vtoProvider: session.vtoProvider ?? null, vtoPreviewUrl: session.vtoPreviewUrl ?? null, archivedAt: session.archivedAt ? new Date(session.archivedAt) : null };
  await db.insert(stylingSessions).values(values).onDuplicateKeyUpdate({ set: { photoUri: values.photoUri, status: values.status, progressJson: values.progressJson, looksJson: values.looksJson, selectedLookId: values.selectedLookId, vtoTaskId: values.vtoTaskId, vtoProvider: values.vtoProvider, vtoPreviewUrl: values.vtoPreviewUrl, archivedAt: values.archivedAt } });
}

export async function listStylingSessions(limit = 8): Promise<StylingSession[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(stylingSessions).orderBy(desc(stylingSessions.updatedAt)).limit(limit);
  return rows.map(sessionFromRow);
}

export async function loadStylingSession(sessionId: string): Promise<StylingSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(stylingSessions).where(eq(stylingSessions.id, sessionId)).limit(1);
  return rows[0] ? sessionFromRow(rows[0]) : undefined;
}

export async function deleteStylingSession(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(stylingSessions).where(eq(stylingSessions.id, sessionId));
}

export async function savePreparedCart(cart: CartState): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(preparedCarts).values({ lookId: cart.lookId, cartJson: JSON.stringify(cart) }).onDuplicateKeyUpdate({ set: { cartJson: JSON.stringify(cart) } });
}

export function parsePersistedCart(raw: string): CartState | undefined {
  try {
    const parsed = JSON.parse(raw) as Partial<CartState>;
    if (!parsed || typeof parsed !== "object" || typeof parsed.lookId !== "string" || !Array.isArray(parsed.items) || typeof parsed.totalCents !== "number" || typeof parsed.status !== "string") return undefined;
    return parsed as CartState;
  } catch {
    return undefined;
  }
}

export async function loadPreparedCart(cartId: string): Promise<CartState | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const direct = await db.select().from(preparedCarts).where(eq(preparedCarts.lookId, cartId)).limit(1);
  if (direct[0]) return parsePersistedCart(direct[0].cartJson);
  // Older rows use lookId as the table key, while the app recovers drafts by cart.id.
  // Scan the small prepared-cart table and match the serialized cart ID for restart-safe recovery.
  const rows = await db.select().from(preparedCarts);
  for (const row of rows) {
    const cart = parsePersistedCart(row.cartJson);
    if (cart?.id === cartId) return cart;
  }
  return undefined;
}
