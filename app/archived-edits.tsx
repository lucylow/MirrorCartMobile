import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EditorialCard, SerifTitle, SectionLabel, mirrorPalette } from "@/components/mirror-ui";
import { trpc } from "@/lib/trpc";
import { userFacingError } from "@/lib/utils";
import { getArchivedCacheSavedAt, parseArchivedSessionCache, serializeArchivedSessionCache } from "@/lib/archived-cache";
import { formatRelativeTime } from "@/lib/relative-time";
import { notifySuccessHaptic } from "@/lib/haptics";
import type { StylingSession } from "@/shared/types";

const ARCHIVED_SESSION_CACHE_KEY = "mirrorcart.archived-sessions.v1";

export default function ArchivedEditsScreen() {
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const archived = trpc.styling.archived.useQuery({ limit: 20 });
  const { isFetching, refetch } = archived;
  const [cachedSessions, setCachedSessions] = useState<StylingSession[]>([]);
  const [cachedSavedAt, setCachedSavedAt] = useState<string>();
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [statusMessage, setStatusMessage] = useState<string>();

  useEffect(() => {
    AsyncStorage.getItem(ARCHIVED_SESSION_CACHE_KEY)
      .then((raw) => {
        if (!raw) return;
        const sessions = parseArchivedSessionCache(raw);
        setCachedSessions(sessions);
        setCachedSavedAt(getArchivedCacheSavedAt(raw));
        if (sessions.length && raw.trimStart().startsWith("[")) {
          AsyncStorage.setItem(ARCHIVED_SESSION_CACHE_KEY, serializeArchivedSessionCache(sessions)).catch(() => undefined);
        }
      })
      .catch(() => undefined)
      .finally(() => setCacheLoaded(true));
  }, []);

  useEffect(() => {
    if (!archived.data) return;
    setCachedSessions(archived.data);
    const savedAt = new Date().toISOString();
    setCachedSavedAt(savedAt);
    AsyncStorage.setItem(ARCHIVED_SESSION_CACHE_KEY, serializeArchivedSessionCache(archived.data, Date.parse(savedAt))).catch(() => undefined);
  }, [archived.data]);

  const restore = trpc.styling.unarchive.useMutation({ onSuccess: (_, variables) => { setCachedSessions((sessions) => sessions.filter((session) => session.id !== variables.sessionId)); setStatusMessage("Edit restored to Recent Edits."); archived.refetch(); } });
  const permanentDelete = trpc.styling.permanentDelete.useMutation({ onSuccess: (_, variables) => { setCachedSessions((sessions) => sessions.filter((session) => session.id !== variables.sessionId)); setStatusMessage("Edit permanently deleted."); archived.refetch(); } });
  const queryErrorMessage = archived.error ? userFacingError(archived.error, "Archived edits could not be loaded. Try again.") : undefined;
  const visibleSessions = archived.data ?? cachedSessions;
  const showingCachedArchive = !archived.data && cachedSessions.length > 0;
  const cacheReady = Boolean(archived.data) || cacheLoaded;

  const refreshArchive = useCallback(() => {
    if (isFetching) return;
    setErrorMessage(undefined);
    setStatusMessage(undefined);
    refetch().then((result) => {
      if (result.error) {
        setErrorMessage(userFacingError(result.error, "The archive could not be refreshed. Try again."));
        return;
      }
      notifySuccessHaptic();
      setStatusMessage("Archive refreshed.");
    }).catch((error) => setErrorMessage(userFacingError(error, "The archive could not be refreshed. Try again.")));
  }, [isFetching, refetch]);

  const handledReconnectRefresh = useRef(false);
  useEffect(() => {
    if (refresh !== "1" || handledReconnectRefresh.current || isFetching) return;
    handledReconnectRefresh.current = true;
    refreshArchive();
  }, [refresh, isFetching, refreshArchive]);

  const clearLocalCache = () => {
    Alert.alert(
      "Clear local archive cache?",
      "This removes only the copy saved on this device. Server-side archived edits, carts, approvals, and merchant data are not affected.",
      [
        { text: "Keep cache", style: "cancel" },
        {
          text: "Clear local cache",
          style: "destructive",
          onPress: () => {
            setErrorMessage(undefined);
            AsyncStorage.removeItem(ARCHIVED_SESSION_CACHE_KEY)
              .then(() => { setCachedSessions([]); setCachedSavedAt(undefined); setStatusMessage("Local archive cache cleared. Server edits were not changed."); })
              .catch(() => setErrorMessage("Local archive cache could not be cleared. Try again."));
          },
        },
      ],
    );
  };

  const confirmDelete = (session: StylingSession) => {
    const submitDelete = () => {
      Alert.alert(
        "Final confirmation",
        "This is permanent. Confirm that you understand this archived edit cannot be restored.",
        [
          { text: "Keep edit", style: "cancel" },
          {
            text: "I understand, delete",
            style: "destructive",
            onPress: () => {
              setErrorMessage(undefined);
              permanentDelete.mutate(
                { sessionId: session.id },
                { onError: (error) => setErrorMessage(userFacingError(error, "This edit could not be deleted. Try again.")) },
              );
            },
          },
        ],
      );
    };

    Alert.alert(
      "Delete this edit permanently?",
      "This removes the archived edit and cannot be undone. Nothing will be purchased.",
      [
        { text: "Keep edit", style: "cancel" },
        { text: "Continue", onPress: submitDelete },
      ],
    );
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={visibleSessions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={archived.isFetching}
        onRefresh={refreshArchive}
        progressViewOffset={12}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <View className="flex-row items-center pt-3">
              <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                <IconSymbol name="chevron.left" size={25} color={mirrorPalette.charcoal} />
              </Pressable>
              <Text className="ml-5 text-xs font-semibold tracking-[2px] text-primary">ARCHIVED EDITS</Text>
            </View>
            <SerifTitle style={{ marginTop: 28 }}>Past edits, kept{`\n`}under your control.</SerifTitle>
            <Text className="mt-3 text-base leading-6 text-muted">Restore an edit when you want another look, or permanently remove it when you are ready.</Text>
            {errorMessage ? <View className="mt-4 rounded-xl border border-[#E5B4AA] bg-[#FFF3EF] px-3 py-2"><Text className="text-xs leading-5 text-[#9B3F32]">{errorMessage}</Text></View> : null}
            {queryErrorMessage ? <View className="mt-4 rounded-xl border border-[#E5B4AA] bg-[#FFF3EF] px-3 py-2"><View className="flex-row items-center justify-between"><Text className="flex-1 text-xs leading-5 text-[#9B3F32]">{queryErrorMessage}</Text><Pressable onPress={refreshArchive} disabled={archived.isFetching} accessibilityRole="button" accessibilityLabel="Retry archived edits"><Text className="ml-3 text-xs font-bold text-[#9B3F32]">{archived.isFetching ? "Retrying…" : "Retry"}</Text></Pressable></View></View> : null}
            {statusMessage ? <View className="mt-4 rounded-xl bg-[#E8EEE9] px-3 py-2"><Text className="text-xs leading-5 text-[#617267]">{statusMessage}</Text></View> : null}
            {archived.isLoading ? <View className="mt-4 rounded-xl bg-[#F2EFE8] px-3 py-2"><Text className="text-xs text-muted">Loading archived edits…</Text></View> : null}
            {showingCachedArchive ? <View className="mt-4 rounded-xl bg-[#F2EFE8] px-3 py-2"><Text className="text-xs leading-5 text-muted">Showing the last saved archive while connection is restored.</Text></View> : null}
            {cachedSavedAt ? <Text className="mt-3 text-xs text-muted">Last synced locally {formatRelativeTime(cachedSavedAt)}</Text> : null}
            {archived.isFetching && !archived.isLoading ? <Text className="mt-3 text-xs text-muted">Refreshing archive…</Text> : null}
            <View className="mt-8 flex-row items-center justify-between"><SectionLabel>ARCHIVE</SectionLabel><View className="flex-row items-center">{visibleSessions.length > 0 ? <Text className="mr-3 text-xs font-semibold text-primary">{visibleSessions.length} saved</Text> : null}<Pressable onPress={refreshArchive} disabled={archived.isFetching} accessibilityRole="button" accessibilityLabel="Refresh archived edits" style={({ pressed }) => [{ opacity: archived.isFetching ? 0.45 : 1 }, pressed && { opacity: 0.65 }]}><Text className="mr-3 text-xs font-semibold text-muted">{archived.isFetching ? "Refreshing…" : "Refresh"}</Text></Pressable><Pressable onPress={clearLocalCache} disabled={!cachedSessions.length} accessibilityRole="button" accessibilityLabel="Clear local archive cache" style={({ pressed }) => [{ opacity: cachedSessions.length ? 1 : 0.45 }, pressed && { opacity: 0.65 }]}><Text className="text-xs font-semibold text-muted">Clear local</Text></Pressable></View></View>
          </View>
        }
        renderItem={({ item }: { item: StylingSession }) => (
          <EditorialCard style={{ marginTop: 10, padding: 12 }}>
            <View className="flex-row items-center">
              <View className="mr-3 h-16 w-16 overflow-hidden rounded-2xl bg-[#E8EEE9]"><Image source={{ uri: item.vtoPreviewUrl || item.looks[0]?.items[0]?.imageUrl }} className="h-full w-full" /></View>
              <View className="flex-1"><Text className="font-semibold text-foreground">{item.intent.occasion || "Styling session"}</Text><Text className="mt-1 text-xs text-muted">{item.intent.aesthetic} · {item.looks.length} looks</Text><Text className="mt-1 text-xs text-muted">Archived {item.archivedAt ? new Date(item.archivedAt).toLocaleDateString() : "recently"}</Text></View>
            </View>
            <View className="mt-3 flex-row gap-2">
              <Pressable onPress={() => { setErrorMessage(undefined); setStatusMessage(undefined); restore.mutate({ sessionId: item.id }, { onError: (error) => setErrorMessage(userFacingError(error, "This edit could not be restored. Try again.")) }); }} disabled={restore.isPending || permanentDelete.isPending} style={({ pressed }) => [{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: mirrorPalette.gold, paddingVertical: 10, alignItems: "center" }, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel={`Restore ${item.intent.occasion || "styling session"}`}><Text className="text-xs font-bold text-primary">{restore.isPending ? "Restoring…" : "Restore"}</Text></Pressable>
              <Pressable onPress={() => confirmDelete(item)} disabled={restore.isPending || permanentDelete.isPending} style={({ pressed }) => [{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: "#E5B4AA", paddingVertical: 10, alignItems: "center" }, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel={`Permanently delete ${item.intent.occasion || "styling session"}`}><Text className="text-xs font-bold text-[#9B3F32]">{permanentDelete.isPending ? "Deleting…" : "Delete permanently"}</Text></Pressable>
            </View>
          </EditorialCard>
        )}
        ListEmptyComponent={cacheReady && !archived.isLoading && !queryErrorMessage ? <View className="mt-5 items-center rounded-3xl border border-dashed border-border p-8"><IconSymbol name="bookmark" size={26} color={mirrorPalette.gold} /><Text className="mt-3 text-center text-base font-semibold text-foreground">No archived edits</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">Archived edits will stay here until you restore or remove them.</Text></View> : null}
      />
    </ScreenContainer>
  );
}
