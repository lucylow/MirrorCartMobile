import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const stylingSessions = mysqlTable("styling_sessions", {
  id: varchar("id", { length: 96 }).primaryKey(),
  intentJson: text("intentJson").notNull(),
  photoUri: text("photoUri"),
  status: varchar("status", { length: 32 }).notNull(),
  progressJson: text("progressJson").notNull(),
  looksJson: text("looksJson").notNull(),
  selectedLookId: varchar("selectedLookId", { length: 96 }),
  vtoTaskId: varchar("vtoTaskId", { length: 160 }),
  vtoProvider: varchar("vtoProvider", { length: 32 }),
  vtoPreviewUrl: text("vtoPreviewUrl"),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const preparedCarts = mysqlTable("prepared_carts", {
  lookId: varchar("lookId", { length: 96 }).primaryKey(),
  cartJson: text("cartJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StylingSessionRow = typeof stylingSessions.$inferSelect;
export type PreparedCartRow = typeof preparedCarts.$inferSelect;
