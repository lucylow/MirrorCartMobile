export type SavedWardrobePiece = {
  id: string;
  name: string;
  createdAt: string;
};

export const WARDROBE_STORAGE_KEY = "mirrorcart.wardrobe.v1";

export function isLatestWardrobeWrite(writeRevision: number, latestRevision: number): boolean {
  return writeRevision === latestRevision;
}

export type WardrobeSnapshot = { pieces: SavedWardrobePiece[]; savedAt?: string; removedNames: string[] };

export function parseWardrobeSnapshot(raw: string | null): WardrobeSnapshot {
  if (!raw) return { pieces: [], removedNames: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return { pieces: normalizeWardrobePieces(parsed), removedNames: [] };
    if (!parsed || typeof parsed !== "object") return { pieces: [], removedNames: [] };
    const snapshot = parsed as { pieces?: unknown; savedAt?: unknown; removedNames?: unknown };
    return { pieces: normalizeWardrobePieces(snapshot.pieces), savedAt: typeof snapshot.savedAt === "string" ? snapshot.savedAt : undefined, removedNames: normalizeRemovedNames(snapshot.removedNames) };
  } catch {
    return { pieces: [], removedNames: [] };
  }
}

export function normalizeRemovedNames(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input.filter((name): name is string => typeof name === "string").map((name) => name.trim()).filter(Boolean).filter((name) => { const key = name.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 50);
}

export function serializeWardrobeSnapshot(pieces: SavedWardrobePiece[], savedAt: string, removedNames: string[] = []): string {
  return JSON.stringify({ pieces: normalizeWardrobePieces(pieces), savedAt, removedNames: normalizeRemovedNames(removedNames) });
}

export function normalizeWardrobePieces(input: unknown): SavedWardrobePiece[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input
    .filter((candidate): candidate is SavedWardrobePiece => {
      if (!candidate || typeof candidate !== "object") return false;
      const piece = candidate as Partial<SavedWardrobePiece>;
      return typeof piece.id === "string" && piece.id.trim().length > 0 && typeof piece.name === "string" && piece.name.trim().length > 0 && typeof piece.createdAt === "string";
    })
    .map((piece) => ({ id: piece.id.trim(), name: piece.name.trim(), createdAt: piece.createdAt }))
    .filter((piece) => !seen.has(piece.id) && seen.add(piece.id))
    .slice(0, 50);
}

export function parseWardrobePieces(raw: string | null): SavedWardrobePiece[] {
  return parseWardrobeSnapshot(raw).pieces;
}

export function serializeWardrobePieces(pieces: SavedWardrobePiece[]): string {
  return JSON.stringify(normalizeWardrobePieces(pieces));
}

export function wardrobeFreshness(savedAt: string | undefined, now = Date.now()): { label: string; accessibilityLabel: string } {
  if (!savedAt) return { label: "Local wardrobe age unavailable", accessibilityLabel: "Local wardrobe age is unavailable" };
  const timestamp = Date.parse(savedAt);
  if (!Number.isFinite(timestamp) || timestamp > now) return { label: "Local wardrobe age unavailable", accessibilityLabel: "Local wardrobe age is unavailable" };
  const minutes = Math.floor((now - timestamp) / 60_000);
  if (minutes < 1) return { label: "Updated just now", accessibilityLabel: "Local wardrobe updated just now" };
  if (minutes < 60) return { label: `Updated ${minutes}m ago`, accessibilityLabel: `Local wardrobe updated ${minutes} minutes ago` };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { label: `Updated ${hours}h ago`, accessibilityLabel: `Local wardrobe updated ${hours} hours ago` };
  const days = Math.floor(hours / 24);
  return { label: `Updated ${days}d ago`, accessibilityLabel: `Local wardrobe updated ${days} days ago` };
}
