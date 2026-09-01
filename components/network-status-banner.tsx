import { useEffect, useRef, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { useNetworkState } from "expo-network";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { getNetworkBannerPresentation } from "@/lib/network-banner-policy";
import { notifySuccessHaptic } from "@/lib/haptics";

/**
 * Keeps network messaging conservative: an unknown initial state is not treated as offline.
 * The banner explains what is paused without implying that a purchase can happen offline.
 */
export function NetworkStatusBanner() {
  const networkState = useNetworkState();
  const queryClient = useQueryClient();
  const wasOfflineRef = useRef(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const offlinePresentation = getNetworkBannerPresentation(networkState);

  useEffect(() => {
    if (offlinePresentation.kind === "offline") {
      wasOfflineRef.current = true;
      setShowReconnected(false);
      return;
    }
    if (wasOfflineRef.current && offlinePresentation.kind === "reconnected") {
      wasOfflineRef.current = false;
      setShowReconnected(true);
      setRefreshComplete(false);
      void queryClient.invalidateQueries({ refetchType: "active" })
        .catch(() => undefined)
        .finally(() => setRefreshComplete(true));
      notifySuccessHaptic();
      const timeout = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timeout);
    }
  }, [offlinePresentation.kind, queryClient]);

  const presentation = showReconnected
    ? getNetworkBannerPresentation(networkState, true, refreshComplete)
    : offlinePresentation;

  if (!presentation.visible) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={presentation.accessibilityLabel}
      style={{
        position: "absolute",
        top: 12,
        left: 20,
        right: 20,
        zIndex: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: presentation.kind === "reconnected" ? "#B7CDBA" : "#E5B4AA",
        backgroundColor: presentation.kind === "reconnected" ? "#EFF7F0" : "#FFF3EF",
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <Text className={presentation.kind === "reconnected" ? "text-center text-xs font-semibold text-[#496650]" : "text-center text-xs font-semibold text-[#9B3F32]"}>{presentation.title}</Text>
      <Text className={presentation.kind === "reconnected" ? "mt-1 text-center text-xs leading-4 text-[#496650]" : "mt-1 text-center text-xs leading-4 text-[#9B3F32]"}>{presentation.message}</Text>
      {presentation.kind === "reconnected" ? <Pressable onPress={() => { setShowReconnected(false); router.push("/archived-edits?refresh=1"); }} accessibilityRole="button" accessibilityLabel="Review refreshed data" style={({ pressed }) => [{ alignSelf: "center", marginTop: 8, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }, pressed && { opacity: 0.65 }]}><Text className="text-xs font-bold text-[#496650]">Review refreshed data</Text></Pressable> : null}
    </View>
  );
}
