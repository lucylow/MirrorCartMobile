import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EditorialCard, SectionLabel, SerifTitle, mirrorPalette } from "@/components/mirror-ui";
import { trpc } from "@/lib/trpc";
import { loadSavedSnapshots, normalizeSavedSnapshotRemovals, parseSavedSnapshotRefresh, parseSavedSnapshotRemovals, pruneSavedSnapshotRemovals, SAVED_SNAPSHOT_REFRESHED_AT_KEY, SAVED_SNAPSHOT_REMOVALS_KEY, SAVED_SNAPSHOT_UNDO_WINDOW_MS, SAVED_SNAPSHOTS_STORAGE_KEY, savedSnapshotRefreshCopy, savedSnapshotStatus, serializeSavedSnapshotRemovals, serializeSavedSnapshots } from "@/lib/saved-snapshot-cache";
import type { StylingSession } from "@/shared/types";

export default function SavedScreen() {
  const recent = trpc.styling.recent.useQuery({ limit: 8 });
  const [localSessions, setLocalSessions] = useState<StylingSession[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lastRestoredId, setLastRestoredId] = useState<string>();
  const [lastDeletedId, setLastDeletedId] = useState<string>();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>();
  const remoteSessions = useMemo(() => recent.data ?? [], [recent.data]);
  const hasRemoteData = remoteSessions.length > 0;
  const visibleSessions = useMemo(() => {
    const removed = new Set(removedIds);
    return (hasRemoteData ? remoteSessions : localSessions).filter((session) => !removed.has(session.id));
  }, [hasRemoteData, localSessions, removedIds, remoteSessions]);
  const statusCopy = savedSnapshotStatus(hasRemoteData, recent.isError, visibleSessions.length > 0);
  const removedSessions = useMemo(() => {
    const removed = new Set(removedIds);
    return (hasRemoteData ? remoteSessions : localSessions).filter((session) => removed.has(session.id));
  }, [hasRemoteData, localSessions, removedIds, remoteSessions]);

  useEffect(() => {
    Promise.all([
      loadSavedSnapshots(() => AsyncStorage.getItem(SAVED_SNAPSHOTS_STORAGE_KEY)),
      AsyncStorage.getItem(SAVED_SNAPSHOT_REMOVALS_KEY).then(parseSavedSnapshotRemovals).catch(() => []),
      AsyncStorage.getItem(SAVED_SNAPSHOT_REFRESHED_AT_KEY).then(parseSavedSnapshotRefresh).catch(() => undefined),
    ]).then(([sessions, removals, refreshedAt]) => { const pruned = pruneSavedSnapshotRemovals(removals, sessions); setLocalSessions(sessions); setRemovedIds(pruned); setLastRefreshedAt(refreshedAt); if (pruned.length !== removals.length) void AsyncStorage.setItem(SAVED_SNAPSHOT_REMOVALS_KEY, serializeSavedSnapshotRemovals(pruned)); }).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!lastDeletedId) return;
    const timeout = setTimeout(() => setLastDeletedId(undefined), SAVED_SNAPSHOT_UNDO_WINDOW_MS);
    return () => clearTimeout(timeout);
  }, [lastDeletedId]);

  useEffect(() => {
    if (!hasRemoteData) return;
    setLocalSessions(remoteSessions);
    const pruned = pruneSavedSnapshotRemovals(removedIds, remoteSessions);
    if (pruned.length !== removedIds.length) { setRemovedIds(pruned); void AsyncStorage.setItem(SAVED_SNAPSHOT_REMOVALS_KEY, serializeSavedSnapshotRemovals(pruned)); }
    const refreshedAt = new Date().toISOString();
    setLastRefreshedAt(refreshedAt);
    void AsyncStorage.setItem(SAVED_SNAPSHOT_REFRESHED_AT_KEY, refreshedAt);
    void AsyncStorage.setItem(SAVED_SNAPSHOTS_STORAGE_KEY, serializeSavedSnapshots(remoteSessions));
  }, [hasRemoteData, remoteSessions, removedIds]);

  const restoreSnapshot = (sessionId: string) => {
    const next = removedIds.filter((id) => id !== sessionId);
    setRemovedIds(next);
    setCacheCleared(false);
    setLastRestoredId(sessionId);
    setLastDeletedId(undefined);
    void AsyncStorage.setItem(SAVED_SNAPSHOT_REMOVALS_KEY, serializeSavedSnapshotRemovals(next));
  };

  const clearLocalCache = () => {
    Alert.alert("Clear device cache?", "This removes cached snapshots and local hide preferences from this device. It does not delete recent edits from your account.", [
      { text: "Keep cache", style: "cancel" },
      { text: "Clear cache", style: "destructive", onPress: () => {
        setLocalSessions([]);
        setRemovedIds([]);
        setLastDeletedId(undefined);
        setLastRestoredId(undefined);
        setLastRefreshedAt(undefined);
        setCacheCleared(true);
        void AsyncStorage.multiRemove([SAVED_SNAPSHOTS_STORAGE_KEY, SAVED_SNAPSHOT_REMOVALS_KEY, SAVED_SNAPSHOT_REFRESHED_AT_KEY]);
      } },
    ]);
  };

  const removeSnapshot = (session: StylingSession) => {
    Alert.alert("Remove this snapshot?", "It will be hidden from Saved Snapshots on this device. Your styling session remains available in recent edits.", [
      { text: "Keep it", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        const next = normalizeSavedSnapshotRemovals([...removedIds, session.id]);
        setRemovedIds(next);
        setCacheCleared(false);
        setLastDeletedId(session.id);
        setLastRestoredId(undefined);
        void AsyncStorage.setItem(SAVED_SNAPSHOT_REMOVALS_KEY, serializeSavedSnapshotRemovals(next));
      } },
    ]);
  };

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><FlatList data={visibleSessions} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={{ gap: 12 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} ListHeaderComponent={<View className="w-full pt-3"><Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={{ paddingVertical: 6 }}><IconSymbol name="chevron.left" size={24} color={mirrorPalette.charcoal} /></Pressable><SectionLabel>SAVED</SectionLabel><SerifTitle style={{ marginTop: 7 }}>Your snapshots</SerifTitle><Text className="mt-3 text-base leading-6 text-muted">Keep the looks that feel like you. Revisit an edit whenever the moment comes back around.</Text>{lastDeletedId ? <View className="mt-4 flex-row items-center justify-between rounded-xl bg-[#E8EEE9] px-3 py-2"><Text className="mr-3 flex-1 text-xs text-[#617267]">Snapshot removed from Saved.</Text><Pressable onPress={() => restoreSnapshot(lastDeletedId)} accessibilityRole="button" accessibilityLabel="Undo snapshot removal" style={({ pressed }) => [{ paddingHorizontal: 8, paddingVertical: 4 }, pressed && { opacity: 0.7 }]}><Text className="text-xs font-bold text-primary">Undo</Text></Pressable></View> : null}<Text className={`mt-3 text-xs font-semibold ${recent.isError && !visibleSessions.length ? "text-[#9B3F32]" : "text-[#617267]"}`} accessibilityLabel={statusCopy}>{hydrated ? statusCopy : "Loading your saved snapshots"}</Text><Text className="mt-1 text-xs text-muted">{visibleSessions.length} visible · {savedSnapshotRefreshCopy(lastRefreshedAt)}</Text>{cacheCleared ? <Text className="mt-2 text-sm font-semibold text-[#617267]" accessibilityRole="alert">Device cache cleared. Recent edits remain available.</Text> : null}<Pressable onPress={clearLocalCache} accessibilityRole="button" accessibilityLabel="Clear Saved Snapshots device cache" style={({ pressed }) => [{ alignSelf: "flex-start", marginTop: 10, paddingVertical: 4 }, pressed && { opacity: 0.7 }]}><Text className="text-xs font-semibold text-muted">Clear device cache</Text></Pressable>{lastRestoredId ? <Text className="mt-2 text-sm font-semibold text-[#617267]" accessibilityRole="alert">Snapshot restored to Saved.</Text> : null}{removedSessions.length > 0 ? <View className="mt-5 rounded-2xl border border-[#E5D8B4] bg-[#FBF7EA] p-4"><Text className="text-xs font-bold uppercase tracking-[2px] text-[#9A7B2F]">Removed snapshots</Text><Text className="mt-2 text-sm leading-5 text-muted">Hidden only on this device. Restore any edit when you want it back.</Text>{removedSessions.map((session) => <View key={`removed-${session.id}`} className="mt-3 flex-row items-center justify-between"><Text className="mr-3 flex-1 text-sm font-semibold text-foreground">{session.looks[0]?.title || session.intent.occasion || "Saved edit"}</Text><Pressable onPress={() => restoreSnapshot(session.id)} accessibilityRole="button" accessibilityLabel={`Restore ${session.intent.occasion || "snapshot"}`} style={({ pressed }) => [{ paddingHorizontal: 10, paddingVertical: 5 }, pressed && { opacity: 0.7 }]}><Text className="text-xs font-bold text-primary">Restore</Text></Pressable></View>)}</View> : null}</View>} renderItem={({ item }: { item: StylingSession }) => { const look = item.looks[0]; const imageUrl = item.vtoPreviewUrl || look?.items[0]?.imageUrl; return <EditorialCard style={{ marginTop: 18, flex: 1, overflow: "hidden", padding: 0 }}><Pressable onPress={() => router.push({ pathname: "/looks", params: { session: JSON.stringify(item) } })} style={({ pressed }) => [pressed && { opacity: 0.75 }]} accessibilityRole="button" accessibilityLabel={`Open saved ${item.intent.occasion || "look"}`}><View className="h-48 bg-[#E8EEE9]">{imageUrl ? <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" /> : <View className="flex-1 items-center justify-center"><IconSymbol name="image" size={25} color={mirrorPalette.sage} /></View>}</View><View className="p-3"><Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{look?.title || item.intent.occasion || "Saved edit"}</Text><Text className="mt-1 text-xs text-muted" numberOfLines={1}>{item.intent.aesthetic}</Text><View className="mt-3 flex-row items-center justify-between"><Text className="text-xs font-bold text-primary">Open edit →</Text><Pressable onPress={() => removeSnapshot(item)} accessibilityRole="button" accessibilityLabel={`Remove saved ${item.intent.occasion || "snapshot"}`} style={({ pressed }) => [{ paddingVertical: 4, paddingLeft: 8 }, pressed && { opacity: 0.7 }]}><Text className="text-xs font-semibold text-muted">Remove</Text></Pressable></View></View></Pressable></EditorialCard>; }} ListEmptyComponent={<View className="mt-7 w-full items-center rounded-3xl border border-dashed border-border p-8"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#F2EFE8]"><IconSymbol name="bookmark" size={28} color={mirrorPalette.gold} /></View><Text className="mt-4 text-center text-xl text-foreground" style={{ fontFamily: "Georgia" }}>{recent.isError ? "Snapshots unavailable" : "No snapshots yet"}</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">{recent.isError ? "Reconnect to recover recent edits, or create a new preview from Try On." : "Create a preview from Try On and it will be ready to revisit here."}</Text><Pressable onPress={() => router.push("/try-on")} accessibilityRole="button" accessibilityLabel="Open Try On" style={({ pressed }) => [{ marginTop: 18, borderRadius: 15, backgroundColor: mirrorPalette.gold, paddingHorizontal: 22, paddingVertical: 13 }, pressed && { opacity: 0.8 }]}><Text className="font-bold text-white">Open Try On</Text></Pressable></View>} /></ScreenContainer>;
}
