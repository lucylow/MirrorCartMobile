import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 } }}><Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} /> }} /><Tabs.Screen name="looks" options={{ title: "Discover", tabBarIcon: ({ color }) => <IconSymbol size={22} name="search" color={color} /> }} /><Tabs.Screen name="try-on" options={{ title: "Try On", tabBarIcon: ({ color }) => <IconSymbol size={22} name="camera.fill" color={color} /> }} /><Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon: ({ color }) => <IconSymbol size={22} name="shopping-bag" color={color} /> }} /><Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <IconSymbol size={22} name="person" color={color} /> }} /><Tabs.Screen name="look-detail" options={{ href: null }} /><Tabs.Screen name="product-detail" options={{ href: null }} /><Tabs.Screen name="settings" options={{ href: null }} /><Tabs.Screen name="saved" options={{ href: null }} /><Tabs.Screen name="wardrobe" options={{ href: null }} /><Tabs.Screen name="stylist" options={{ href: null }} /><Tabs.Screen name="notifications" options={{ href: null }} /></Tabs>;
}
