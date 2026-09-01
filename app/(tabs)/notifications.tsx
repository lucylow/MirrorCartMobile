import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SectionLabel, SerifTitle, mirrorPalette } from "@/components/mirror-ui";

const NOTES = [
  { id: "stylist", title: "AI Stylist", message: "Your next look is ready to review when you are.", icon: "sparkles" as const, unread: true },
  { id: "preview", title: "Try On", message: "Your latest visualization is saved in Snapshots.", icon: "camera.fill" as const, unread: true },
  { id: "catalog", title: "Catalog check", message: "Some merchant details need confirmation before you shop.", icon: "shopping-bag" as const, unread: true },
  { id: "wardrobe", title: "Wardrobe note", message: "Owned pieces are protected from the shopping total.", icon: "checkroom" as const, unread: false },
];

export default function NotificationsScreen() {
  const [unread, setUnread] = useState(() => new Set(NOTES.filter((note) => note.unread).map((note) => note.id)));
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><FlatList data={NOTES} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} ListHeaderComponent={<View className="pt-3"><View className="flex-row items-center justify-between"><Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={{ paddingVertical: 6 }}><IconSymbol name="chevron.left" size={24} color={mirrorPalette.charcoal} /></Pressable><Pressable onPress={() => setUnread(new Set())} accessibilityRole="button" accessibilityLabel="Mark all notifications read" style={{ paddingVertical: 8 }}><Text className="text-xs font-bold text-primary">Mark all read</Text></Pressable></View><SectionLabel>UPDATES</SectionLabel><SerifTitle style={{ marginTop: 7 }}>Notifications</SerifTitle><Text className="mt-3 text-base leading-6 text-muted">Small notes from your stylist, your wardrobe, and the catalog.</Text></View>} renderItem={({ item }) => { const isUnread = unread.has(item.id); return <Pressable onPress={() => setUnread((current) => { const next = new Set(current); next.delete(item.id); return next; })} style={({ pressed }) => [{ marginTop: 12, flexDirection: "row", alignItems: "flex-start", borderRadius: 20, borderWidth: isUnread ? 1 : 0, borderColor: mirrorPalette.border, backgroundColor: isUnread ? "#FFFFFF" : mirrorPalette.ivoryDark, padding: 16, boxShadow: isUnread ? "0px 4px 10px rgba(28,28,30,0.05)" : "none" }, pressed && { opacity: 0.75 }]} accessibilityRole="button" accessibilityLabel={`Read ${item.title} notification`}><View className="h-10 w-10 items-center justify-center rounded-full bg-[#F2EFE8]"><IconSymbol name={item.icon} size={19} color={isUnread ? mirrorPalette.gold : mirrorPalette.sage} /></View><View className="ml-3 flex-1"><View className="flex-row items-center justify-between"><Text className="text-sm font-semibold text-foreground">{item.title}</Text>{isUnread && <View className="h-2 w-2 rounded-full bg-[#C9A84C]" />}</View><Text className="mt-1 text-sm leading-5 text-muted">{item.message}</Text></View></Pressable>; }} /></ScreenContainer>;
}
