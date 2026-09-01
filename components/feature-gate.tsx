import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { entitlementCopy, hasCapability, type EntitlementState } from "@/shared/entitlements";

type FeatureGateProps = {
  feature: string;
  entitlement?: EntitlementState;
  children: ReactNode;
  onUpgrade: () => void;
  label?: string;
};

export function FeatureGate({ feature, entitlement, children, onUpgrade, label }: FeatureGateProps) {
  if (hasCapability(entitlement, feature)) return children;

  return (
    <View accessibilityLabel={`${feature} requires premium access`}>
      <Text className="text-sm leading-5 text-muted">{entitlementCopy(entitlement)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? `Unlock ${feature}`}
        onPress={onUpgrade}
        style={({ pressed }) => [
          { marginTop: 10, borderRadius: 14, backgroundColor: "#C9A84C", paddingVertical: 13, alignItems: "center" },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text className="font-bold text-white">{label ?? `Unlock ${feature}`}</Text>
      </Pressable>
    </View>
  );
}
