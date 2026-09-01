import { parseWardrobeSnapshot, type SavedWardrobePiece } from "./wardrobe-storage";

export async function loadLocalWardrobeContext(read: () => Promise<string | null>): Promise<{ pieces: SavedWardrobePiece[]; savedAt?: string; removedNames: string[]; available: boolean }> {
  try {
    const snapshot = parseWardrobeSnapshot(await read());
    return { pieces: snapshot.pieces, savedAt: snapshot.savedAt, removedNames: snapshot.removedNames, available: true };
  } catch {
    return { pieces: [], savedAt: undefined, removedNames: [], available: false };
  }
}

export function isWardrobeNameRemoved(name: string, removedNames: string[]): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized.length > 0 && removedNames.some((removed) => removed.trim().toLowerCase() === normalized);
}

export function mergeOwnedItemNames(manualEntry: string, savedPieces: SavedWardrobePiece[], removedNames: string[] = []): string[] {
  const seen = new Set<string>();
  return [manualEntry, ...savedPieces.map((piece) => piece.name)]
    .filter((name) => !isWardrobeNameRemoved(name, removedNames))
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}
