import { Text, View } from "react-native";
import { useIsFetching } from "@tanstack/react-query";
import { useNetworkState } from "expo-network";
import { getCatalogRefreshStatus } from "@/lib/catalog-refresh-status";

export function CatalogRefreshStatus() {
  const isFetching = useIsFetching();
  const networkState = useNetworkState();
  const status = getCatalogRefreshStatus(isFetching, networkState.isInternetReachable);

  if (!status.visible) return null;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={status.accessibilityLabel}
      style={{
        alignSelf: "flex-start",
        marginTop: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#D8C78A",
        backgroundColor: "#FBF7E8",
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text className="text-[11px] font-bold tracking-[0.8px] text-[#806A1F]">{status.label}…</Text>
    </View>
  );
}
