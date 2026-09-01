import type { StylingSession } from "@/shared/types";

export const SAVED_SNAPSHOTS_STORAGE_KEY = "mirrorcart.saved-snapshots.v1";

export function normalizeSavedSnapshots(input: unknown): StylingSession[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input
    .filter((candidate): candidate is StylingSession => {
      if (!candidate || typeof candidate !== "object") return false;
      const session = candidate as Partial<StylingSession>;
      return typeof session.id === "string" && session.id.trim().length > 0 && Array.isArray(session.looks) && !!session.intent && typeof session.intent === "object";
    })
    .map((session) => ({ ...session, id: session.id.trim() }) as StylingSession)
    .filter((session) => !seen.has(session.id) && seen.add(session.id))
    .slice(0, 20);
}

export function parseSavedSnapshots(raw: string | null): StylingSession[] {
  if (!raw) return [];
  try {
    return normalizeSavedSnapshots(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function serializeSavedSnapshots(sessions: StylingSession[]): string {
  return JSON.stringify(normalizeSavedSnapshots(sessions));
}

export function savedSnapshotStatus(hasRemoteData: boolean, hasRemoteError: boolean, hasLocalData: boolean): string {
  if (hasRemoteData) return "Synced from recent edits";
  if (hasRemoteError && hasLocalData) return "Showing saved snapshots from this device";
  if (hasRemoteError) return "Recent edits are unavailable";
  return "Loading your saved snapshots";
}

export async function loadSavedSnapshots(read: () => Promise<string | null>): Promise<StylingSession[]> {
  try {
    return parseSavedSnapshots(await read());
  } catch {
    return [];
  }
}

export const SAVED_SNAPSHOT_REMOVALS_KEY = "mirrorcart.saved-snapshots.removed.v1";
export const SAVED_SNAPSHOT_UNDO_WINDOW_MS = 8_000;

export function normalizeSavedSnapshotRemovals(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean)
    .filter((id) => !seen.has(id) && seen.add(id))
    .slice(0, 50);
}

export function parseSavedSnapshotRemovals(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return normalizeSavedSnapshotRemovals(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function serializeSavedSnapshotRemovals(ids: string[]): string {
  return JSON.stringify(normalizeSavedSnapshotRemovals(ids));
}

export function pruneSavedSnapshotRemovals(ids: string[], knownSessions: StylingSession[]): string[] {
  const knownIds = new Set(normalizeSavedSnapshots(knownSessions).map((session) => session.id));
  if (knownIds.size === 0) return normalizeSavedSnapshotRemovals(ids);
  return normalizeSavedSnapshotRemovals(ids).filter((id) => knownIds.has(id));
}

export const SAVED_SNAPSHOT_REFRESHED_AT_KEY = "mirrorcart.saved-snapshots.refreshed-at.v1";

export function parseSavedSnapshotRefresh(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) && timestamp <= Date.now() ? new Date(timestamp).toISOString() : undefined;
}

export function savedSnapshotRefreshCopy(refreshedAt: string | undefined, now = Date.now()): string {
  if (!refreshedAt) return "Last refresh unavailable";
  const timestamp = Date.parse(refreshedAt);
  if (!Number.isFinite(timestamp) || timestamp > now) return "Last refresh unavailable";
  const minutes = Math.floor((now - timestamp) / 60_000);
  if (minutes < 1) return "Last refreshed just now";
  if (minutes < 60) return `Last refreshed ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last refreshed ${hours}h ago`;
  return `Last refreshed ${Math.floor(hours / 24)}d ago`;
}
