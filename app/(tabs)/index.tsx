import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EditorialCard, GoldButton, SerifTitle, SectionLabel, mirrorPalette } from "@/components/mirror-ui";
import { CatalogRefreshStatus } from "@/components/catalog-refresh-status";
import { trpc } from "@/lib/trpc";

const occasions = ["Date night", "Work", "Weekend", "Wedding"];

export default function HomeScreen() {
  const catalogStatus = trpc.catalog.status.useQuery();
  const [request, setRequest] = useState("Date night in Toronto. Chic but relaxed, under $180.");
  const [budget, setBudget] = useState("180");
  const [owned, setOwned] = useState("I already own black heels");
  const [occasion, setOccasion] = useState("Date night");
  const startStyling = trpc.styling.start.useMutation();

  async function handleBuild() {
    if (!request.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const session = await startStyling.mutateAsync({
      intent: { mode: "occasion", request, occasion: occasion.toLowerCase(), aesthetic: "chic but relaxed", budgetCents: Math.max(1, Number(budget) || 180) * 100, ownedItems: owned ? [owned] : [] },
    });
    router.push({ pathname: "/looks", params: { session: JSON.stringify(session) } });
  }

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={{ paddingBottom: 44 }} showsVerticalScrollIndicator={false}>
    <View className="flex-row items-center justify-between pt-3"><View><Text className="text-[11px] font-bold tracking-[3px] text-primary">MIRRORCART</Text><Text className="mt-1 text-sm text-muted">See it. Style it. Shop it.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push("/profile")} style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, backgroundColor: mirrorPalette.ivoryDark, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.7 }]}><IconSymbol name="sparkles" size={20} color={mirrorPalette.gold} /></Pressable></View>
    <View className="mt-12"><Text className="text-[11px] font-bold tracking-[2px] text-primary">GOOD EVENING</Text><SerifTitle style={{ marginTop: 8 }}>What are you{`\n`}getting dressed for?</SerifTitle><Text className="mt-4 text-base leading-6 text-muted">Tell us the moment. MirrorCart will build complete looks around your taste, your wardrobe, and your budget.</Text></View>
    <View className="mt-7 flex-row gap-2">{occasions.map((item) => <Pressable key={item} onPress={() => setOccasion(item)} accessibilityRole="button" accessibilityState={{ selected: occasion === item }} style={({ pressed }) => [{ paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, backgroundColor: occasion === item ? mirrorPalette.charcoal : mirrorPalette.ivoryDark }, pressed && { opacity: 0.75 }]}><Text style={{ color: occasion === item ? mirrorPalette.ivory : mirrorPalette.muted, fontSize: 12, fontWeight: "600" }}>{item}</Text></Pressable>)}</View>
    <EditorialCard style={{ marginTop: 18 }}><SectionLabel>YOUR STYLE BRIEF</SectionLabel><TextInput value={request} onChangeText={setRequest} multiline placeholder="e.g. wedding guest under $250" placeholderTextColor="#A8A8AD" className="mt-4 min-h-[92px] text-[18px] leading-7 text-foreground" textAlignVertical="top"/><View className="mt-4 flex-row gap-3"><View className="flex-1 rounded-2xl border border-border px-4 py-3"><Text className="text-[10px] font-bold tracking-[1px] text-muted">MAX BUDGET</Text><View className="mt-1 flex-row items-center"><Text className="text-lg text-foreground">$</Text><TextInput value={budget} onChangeText={setBudget} keyboardType="number-pad" className="ml-1 flex-1 text-lg font-semibold text-foreground" /></View></View><View className="flex-[1.5] rounded-2xl border border-border px-4 py-3"><Text className="text-[10px] font-bold tracking-[1px] text-muted">ALREADY OWN</Text><TextInput value={owned} onChangeText={setOwned} className="mt-1 text-sm font-medium text-foreground" numberOfLines={1} /></View></View></EditorialCard>
    <View className="mt-5 flex-row items-center rounded-2xl bg-[#F2EFE8] px-4 py-3"><IconSymbol name="camera.fill" size={20} color={mirrorPalette.sage} /><Text className="ml-3 flex-1 text-sm leading-5 text-[#58635C]">Add a full-body photo next. Your image stays private until you choose to create a preview.</Text></View>
    <GoldButton onPress={handleBuild} disabled={startStyling.isPending} style={{ marginTop: 22 }}><Text className="text-base font-bold text-white">{startStyling.isPending ? "Building your looks…" : "Build my looks"}</Text></GoldButton>
    <Text className="mt-3 text-center text-xs leading-5 text-muted">{catalogStatus.data?.label ?? "Catalog"} · AI visualization preview · Human-approved shopping</Text><CatalogRefreshStatus />
    <View className="mt-8 rounded-3xl bg-[#1C1C1E] p-5"><View className="flex-row items-center justify-between"><View><Text className="text-[10px] font-bold tracking-[2px] text-[#C9A84C]">THE MIRRORCART METHOD</Text><Text className="mt-2 text-xl text-[#FAF8F4]" style={{ fontFamily: "Georgia" }}>From photo to{`\n`}a complete look.</Text></View><IconSymbol name="sparkles" size={26} color={mirrorPalette.goldLight} /></View><View className="mt-5 flex-row justify-between"><Text className="text-xs text-[#A8A8AD]">01 Brief</Text><Text className="text-xs text-[#A8A8AD]">02 Visualize</Text><Text className="text-xs text-[#A8A8AD]">03 Refine</Text><Text className="text-xs text-[#A8A8AD]">04 Approve</Text></View></View>
  </ScrollView></ScreenContainer>;
}
