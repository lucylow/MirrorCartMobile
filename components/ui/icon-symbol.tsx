import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName = "house.fill" | "paperplane.fill" | "chevron.left.forwardslash.chevron.right" | "chevron.right" | "chevron.left" | "camera.fill" | "sparkles" | "xmark" | "image" | "bookmark" | "search" | "person" | "shopping-bag" | "notifications" | "checkroom" | "chat";
const MAPPING: Record<IconSymbolName, ComponentProps<typeof MaterialIcons>["name"]> = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "camera.fill": "camera-alt",
  sparkles: "auto-awesome",
  xmark: "close",
  image: "image",
  bookmark: "bookmark-border",
  search: "search",
  person: "person-outline",
  "shopping-bag": "shopping-bag",
  notifications: "notifications-none",
  checkroom: "checkroom",
  chat: "chat-bubble-outline",
};

export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: string }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
