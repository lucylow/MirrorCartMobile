import { Pressable, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { Fonts } from "@/constants/theme";

export const mirrorPalette = {
  ivory: "#FAF8F4",
  ivoryDark: "#F2EFE8",
  charcoal: "#1C1C1E",
  muted: "#6B6B70",
  gold: "#C9A84C",
  goldLight: "#E8D49A",
  sage: "#7A9E87",
  rose: "#D4756A",
  border: "#EAE7DF",
};

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text className="text-[11px] font-bold tracking-[2px] text-muted">{children}</Text>;
}

export function SerifTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text className="text-[32px] leading-[38px] text-foreground" style={[{ fontFamily: Fonts.serif }, style]}>{children}</Text>;
}

export function GoldButton({ children, disabled, onPress, style, ...props }: PressableProps & { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Pressable {...props} onPress={onPress} disabled={disabled} style={({ pressed }) => [{ backgroundColor: mirrorPalette.gold, borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", boxShadow: disabled ? "none" : `0px 6px 12px ${mirrorPalette.gold}42` }, style, pressed && { opacity: 0.86, transform: [{ scale: 0.98 }] }, disabled && { opacity: 0.48 }]}>{children}</Pressable>;
}

export function EditorialCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: "#FFFFFF", borderColor: mirrorPalette.border, borderWidth: 1, borderRadius: 24, padding: 18 }, style]}>{children}</View>;
}
