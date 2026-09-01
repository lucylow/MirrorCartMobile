import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EditorialCard, SectionLabel, SerifTitle, mirrorPalette } from "@/components/mirror-ui";
import { trpc } from "@/lib/trpc";
import { WARDROBE_STORAGE_KEY, isLatestWardrobeWrite, normalizeRemovedNames, parseWardrobeSnapshot, serializeWardrobeSnapshot, type SavedWardrobePiece } from "@/lib/wardrobe-storage";
import { wardrobePersistenceCopy, type WardrobePersistenceState } from "@/lib/wardrobe-persistence";
import { isWardrobeNameRemoved } from "@/lib/wardrobe-context";

export default function WardrobeScreen() {
  const recent = trpc.styling.recent.useQuery({ limit: 8 });
  const [savedPieces, setSavedPieces] = useState<SavedWardrobePiece[]>([]);
  const [removedNames, setRemovedNames] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [persistenceState, setPersistenceState] = useState<WardrobePersistenceState>("hydrating");
  const writeRevision = useRef(0);
  const writeQueue = useRef(Promise.resolve());
  const [modalVisible, setModalVisible] = useState(false);
  const [pieceName, setPieceName] = useState("");
  const [pieceError, setPieceError] = useState<string>();
  const [lastRestoredName, setLastRestoredName] = useState<string>();
  const inferredPieces = useMemo(() => Array.from(new Set((recent.data ?? []).flatMap((session) => session.intent.ownedItems.map((name) => name.trim()).filter(Boolean)))).map((name) => ({ id: `inferred-${name.toLowerCase()}`, name, createdAt: "" })), [recent.data]);
  const owned = useMemo(() => {
    const merged = [...savedPieces, ...inferredPieces];
    const seen = new Set<string>();
    return merged.filter((piece) => !isWardrobeNameRemoved(piece.name, removedNames) && !seen.has(piece.id) && seen.add(piece.id));
  }, [inferredPieces, removedNames, savedPieces]);

  useEffect(() => {
    AsyncStorage.getItem(WARDROBE_STORAGE_KEY)
      .then((raw) => { const snapshot = parseWardrobeSnapshot(raw); setSavedPieces(snapshot.pieces); setRemovedNames(snapshot.removedNames); setStorageAvailable(true); setPersistenceState("saved"); })
      .catch(() => { setStorageAvailable(false); setPersistenceState("unavailable"); })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !storageAvailable) return;
    const revision = ++writeRevision.current;
    const savedAt = new Date().toISOString();
    setPersistenceState("saving");
    writeQueue.current = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(WARDROBE_STORAGE_KEY, serializeWardrobeSnapshot(savedPieces, savedAt, removedNames)))
      .then(() => { if (isLatestWardrobeWrite(revision, writeRevision.current)) setPersistenceState("saved"); })
      .catch(() => { if (isLatestWardrobeWrite(revision, writeRevision.current)) { setStorageAvailable(false); setPersistenceState("unavailable"); } });
  }, [hydrated, removedNames, savedPieces, storageAvailable]);

  const persistenceCopy = wardrobePersistenceCopy(persistenceState);

  const addPiece = () => {
    const name = pieceName.trim();
    if (!name) return setPieceError("Give this piece a name first.");
    if (owned.some((piece) => piece.name.toLowerCase() === name.toLowerCase())) return setPieceError("That piece is already in your wardrobe.");
    if (!storageAvailable) return setPieceError("Device storage is unavailable. Try again when local storage is restored.");
    setLastRestoredName(undefined);
    setSavedPieces((current) => [...current, { id: `local-${Date.now()}`, name, createdAt: new Date().toISOString() }]);
    setRemovedNames((current) => current.filter((removed) => removed.toLowerCase() !== name.toLowerCase()));
    setPieceName("");
    setPieceError(undefined);
    setModalVisible(false);
  };

  const removePiece = (piece: SavedWardrobePiece) => {
    Alert.alert("Remove this piece?", `${piece.name} will no longer be used as saved wardrobe context.`, [
      { text: "Keep it", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { setLastRestoredName(undefined); setSavedPieces((current) => current.filter((candidate) => candidate.id !== piece.id)); setRemovedNames((current) => normalizeRemovedNames([...current, piece.name])); } },
    ]);
  };

  const restorePiece = (name: string) => {
    setRemovedNames((current) => current.filter((removed) => removed.toLowerCase() !== name.toLowerCase()));
    setLastRestoredName(name);
  };

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><FlatList data={owned} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={{ gap: 12 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} ListHeaderComponent={<View className="w-full pt-3"><Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={{ paddingVertical: 6 }}><IconSymbol name="chevron.left" size={24} color={mirrorPalette.charcoal} /></Pressable><SectionLabel>YOUR PIECES</SectionLabel><SerifTitle style={{ marginTop: 7 }}>My wardrobe</SerifTitle><Text className="mt-3 text-base leading-6 text-muted">Pieces you already own stay protected in every edit and never count toward the shopping total.</Text><Text className="mt-3 text-xs leading-5 text-[#617267]">Stored locally on this device. Remove a piece anytime.</Text><Text className={`mt-2 text-xs font-semibold ${persistenceState === "unavailable" ? "text-[#9B3F32]" : "text-[#617267]"}`} accessibilityLabel={persistenceCopy.accessibilityLabel}>{persistenceCopy.label}</Text><Pressable onPress={() => { setPieceError(undefined); setModalVisible(true); }} accessibilityRole="button" accessibilityLabel="Add a piece to your wardrobe" style={({ pressed }) => [{ alignSelf: "flex-start", marginTop: 14, borderRadius: 14, backgroundColor: mirrorPalette.gold, paddingHorizontal: 16, paddingVertical: 10 }, pressed && { opacity: 0.75 }]}><Text className="text-xs font-bold text-white">Add a piece</Text></Pressable>{lastRestoredName && removedNames.length === 0 ? <Text className="mt-4 text-sm font-semibold text-[#617267]" accessibilityRole="alert">Restored {lastRestoredName} to your styling context.</Text> : null}{removedNames.length > 0 ? <View className="mt-6 rounded-2xl border border-[#E5D8B4] bg-[#FBF7EA] p-4"><Text className="text-xs font-bold uppercase tracking-[2px] text-[#9A7B2F]">Removed from styling</Text><Text className="mt-2 text-sm leading-5 text-muted">These preferences stay off until you restore them.</Text>{lastRestoredName ? <Text className="mt-3 text-sm font-semibold text-[#617267]" accessibilityRole="alert">Restored {lastRestoredName} to your styling context.</Text> : null}{removedNames.map((name) => <View key={`removed-${name.toLowerCase()}`} className="mt-3 flex-row items-center justify-between"><Text className="mr-3 flex-1 text-sm font-semibold text-foreground">{name}</Text><Pressable onPress={() => restorePiece(name)} accessibilityRole="button" accessibilityLabel={`Restore ${name} to wardrobe styling`} style={({ pressed }) => [{ paddingHorizontal: 10, paddingVertical: 5 }, pressed && { opacity: 0.7 }]}><Text className="text-xs font-bold text-primary">Restore</Text></Pressable></View>)}</View> : null}</View>} renderItem={({ item }) => <EditorialCard style={{ marginTop: 18, flex: 1, minHeight: 166, justifyContent: "space-between", padding: 16 }}><View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8EEE9]"><IconSymbol name="checkroom" size={22} color={mirrorPalette.sage} /></View><Text className="mt-5 text-sm font-semibold leading-5 text-foreground">{item.name}</Text><View className="mt-3 flex-row items-center justify-between"><Pressable onPress={() => router.push("/try-on")} accessibilityRole="button" accessibilityLabel={`Try ${item.name} on`} style={({ pressed }) => [{ paddingVertical: 4 }, pressed && { opacity: 0.7 }]}><Text className="text-xs font-bold text-primary">Try it on →</Text></Pressable><Pressable onPress={() => removePiece(item)} accessibilityRole="button" accessibilityLabel={`Remove ${item.name} from wardrobe`} style={({ pressed }) => [{ paddingVertical: 4 }, pressed && { opacity: 0.7 }]}><Text className="text-xs font-semibold text-muted">Remove</Text></Pressable></View></EditorialCard>} ListEmptyComponent={<View className="mt-7 w-full items-center rounded-3xl border border-dashed border-border p-8"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#E8EEE9]"><IconSymbol name="checkroom" size={28} color={mirrorPalette.sage} /></View><Text className="mt-4 text-center text-xl text-foreground" style={{ fontFamily: "Georgia" }}>Start with what you own</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">Tell MirrorCart about one of your pieces from Home, then we’ll keep it in every look.</Text><Pressable onPress={() => router.push("/")} style={({ pressed }) => [{ marginTop: 18, borderRadius: 15, backgroundColor: mirrorPalette.gold, paddingHorizontal: 22, paddingVertical: 13 }, pressed && { opacity: 0.8 }]}><Text className="font-bold text-white">Build a look</Text></Pressable></View>} /><Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 items-center justify-center bg-black/35 px-5"><View className="w-full rounded-3xl bg-[#FAF8F4] p-5"><Text className="text-xl text-foreground" style={{ fontFamily: "Georgia" }}>Add a wardrobe piece</Text><Text className="mt-2 text-sm leading-5 text-muted">Name it clearly so MirrorCart can keep it in future edits.</Text><TextInput autoFocus value={pieceName} onChangeText={(value) => { setPieceName(value); setPieceError(undefined); }} placeholder="e.g. black leather jacket" placeholderTextColor="#8A877F" returnKeyType="done" onSubmitEditing={addPiece} accessibilityLabel="Wardrobe piece name" className="mt-4 rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground" />{pieceError ? <Text className="mt-2 text-sm text-[#9B3F32]" accessibilityRole="alert">{pieceError}</Text> : null}<View className="mt-5 flex-row justify-end gap-3"><Pressable onPress={() => { setModalVisible(false); setPieceName(""); setPieceError(undefined); }} accessibilityRole="button" accessibilityLabel="Cancel adding wardrobe piece" style={({ pressed }) => [{ paddingHorizontal: 14, paddingVertical: 11 }, pressed && { opacity: 0.7 }]}><Text className="font-semibold text-muted">Cancel</Text></Pressable><Pressable onPress={addPiece} accessibilityRole="button" accessibilityLabel="Save wardrobe piece" style={({ pressed }) => [{ borderRadius: 14, backgroundColor: mirrorPalette.gold, paddingHorizontal: 16, paddingVertical: 11 }, pressed && { opacity: 0.75 }]}><Text className="font-bold text-white">Save piece</Text></Pressable></View></View></KeyboardAvoidingView></Modal></ScreenContainer>;
}
