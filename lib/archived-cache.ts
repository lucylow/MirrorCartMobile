import type { StylingSession } from "@/shared/types";

export const ARCHIVED_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type ArchivedCacheEnvelope = {
  version: 1;
  savedAt: string;
  sessions: unknown;
};

function isArchivedSession(item: unknown): item is StylingSession {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<StylingSession>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.archivedAt === "string" &&
    Boolean(candidate.archivedAt) &&
    Boolean(candidate.intent) &&
    Array.isArray(candidate.looks)
  );
}

/**
 * Serialize a bounded, versioned cache envelope so future schema changes can be safe.
 */
export function serializeArchivedSessionCache(sessions: StylingSession[], now = Date.now()): string {
  const envelope: ArchivedCacheEnvelope = {
    version: 1,
    savedAt: new Date(now).toISOString(),
    sessions,
  };
  return JSON.stringify(envelope);
}

/**
 * Return the trusted save timestamp for a versioned cache envelope.
 */
export function getArchivedCacheSavedAt(raw: string, now = Date.now()): string | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    const envelope = parsed as Partial<ArchivedCacheEnvelope>;
    const savedAt = typeof envelope.savedAt === "string" ? Date.parse(envelope.savedAt) : NaN;
    if (envelope.version !== 1 || !Number.isFinite(savedAt) || savedAt > now || now - savedAt > ARCHIVED_CACHE_MAX_AGE_MS) return undefined;
    return new Date(savedAt).toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Parse archived sessions defensively. Legacy array caches remain readable, while
 * versioned envelopes expire after a bounded period to avoid presenting stale edits forever.
 */
export function parseArchivedSessionCache(raw: string, now = Date.now()): StylingSession[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(isArchivedSession);
    if (!parsed || typeof parsed !== "object") return [];

    const envelope = parsed as Partial<ArchivedCacheEnvelope>;
    if (envelope.version !== 1 || typeof envelope.savedAt !== "string" || !Array.isArray(envelope.sessions)) return [];
    const savedAt = Date.parse(envelope.savedAt);
    if (!Number.isFinite(savedAt) || now - savedAt > ARCHIVED_CACHE_MAX_AGE_MS || savedAt > now) return [];
    return envelope.sessions.filter(isArchivedSession);
  } catch {
    return [];
  }
}
