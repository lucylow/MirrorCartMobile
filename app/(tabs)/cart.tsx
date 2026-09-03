import { useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import type { CartState, Look } from "@/shared/types";
import { SerifTitle } from "@/components/mirror-ui";
import { CatalogRefreshStatus } from "@/components/catalog-refresh-status";
import { userFacingError } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/relative-time";

export default function CartScreen() {
  const params = useLocalSearchParams<{ cart?: string; look?: string }>();
  const initialCart = useMemo<CartState | null>(() => { try { return params.cart ? JSON.parse(params.cart) : null; } catch { return null; } }, [params.cart]);
  const look = useMemo<Look | null>(() => { try { return params.look ? JSON.parse(params.look) : null; } catch { return null; } }, [params.look]);
  const [cart, setCart] = useState(initialCart);
  const [approvalToken, setApprovalToken] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const requestApproval = trpc.commerce.requestApproval.useMutation();
  const approve = trpc.commerce.approve.useMutation();
  const updateDraft = trpc.commerce.updateDraft.useMutation();

  async function changeQuantity(productId: string, qty: number) {
    if (!cart?.id || cart.status !== "draft") return;
    setErrorMessage(undefined);
    try {
      const next = await updateDraft.mutateAsync({ cartId: cart.id, productId, qty });
      setCart(next);
    } catch (error) {
      setErrorMessage(userFacingError(error, "Quantity could not be updated. Try again."));
    }
  }

  async function handleRequestApproval() {
    if (!cart?.id) return;
    setErrorMessage(undefined);
    try {
      const result = await requestApproval.mutateAsync({ cartId: cart.id });
      setCart(result.cart);
      setApprovalToken(result.approval.token);
    } catch (error) {
      setErrorMessage(userFacingError(error, "Approval could not be requested. Review the draft and try again."));
    }
  }

  async function handleApprove() {
    if (!cart?.id || !approvalToken) return;
    setErrorMessage(undefined);
    try {
      const approved = await approve.mutateAsync({ cartId: cart.id, token: approvalToken });
      setCart(approved);
      setApprovalToken(undefined);
    } catch (error) {
      setErrorMessage(userFacingError(error, "Approval expired or was blocked. Refresh the draft and try again."));
    }
  }

  const replacementSeed = cart?.items.find((item) => !item.product.owned)?.product.id ?? "none";
  const replacements = trpc.commerce.replacements.useQuery({ productId: replacementSeed });
  const validation = trpc.commerce.validateDraft.useQuery({ cartId: cart?.id ?? "" }, { enabled: Boolean(cart?.id) });
  const replaceItem = trpc.commerce.replaceItem.useMutation({ onSuccess: (next) => { setErrorMessage(undefined); setCart(next); }, onError: (error) => setErrorMessage(userFacingError(error, "That replacement is no longer available. Refresh the draft and try again.")) });
  const busy = requestApproval.isPending || approve.isPending || updateDraft.isPending || replaceItem.isPending;
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={{ paddingBottom: 36 }}><View className="flex-row items-center justify-between pt-3"><Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back"><IconSymbol name="chevron.left" size={25} color="#1C1C1E" /></Pressable><Text className="text-xs font-semibold tracking-[2px] text-primary">DRAFT CART</Text><View className="w-6" /></View><SerifTitle style={{ marginTop: 28 }}>Review the look{`\n`}before you shop.</SerifTitle><Text className="mt-3 text-base leading-6 text-muted">MirrorCart prepares the cart, but nothing is purchased without your explicit approval.</Text><CatalogRefreshStatus />{cart ? <><View className="mt-8 rounded-[24px] border border-border bg-surface p-4"><View className="mb-3 flex-row items-center justify-between"><Text className="text-xs font-semibold tracking-[1.5px] text-muted">{look?.title?.toUpperCase() || "YOUR LOOK"}</Text><Text className="text-lg font-bold text-foreground">${((cart.totalCents || 0) / 100).toFixed(0)}</Text></View>{cart.items.map(({ product, quantity }) => <View key={product.id} className="flex-row items-center border-t border-border py-3"><Image source={{ uri: product.imageUrl }} className="h-14 w-14 rounded-xl" /><View className="ml-3 flex-1"><Text className="font-semibold text-foreground">{product.name}</Text><Text className="mt-1 text-xs text-muted">{product.owned ? "Already owned · not charged" : `${product.brand} · ${product.color}`}</Text><Text className={`mt-1 text-xs font-semibold ${product.availability === "unavailable" ? "text-error" : product.availability === "limited" ? "text-warning" : "text-success"}`}>{product.availability === "unavailable" ? product.availabilityReason || "Unavailable — choose another option" : product.availability === "limited" ? product.availabilityReason || "Limited availability" : product.availability === "in_stock" ? "In stock" : "Availability confirmed at merchant"}</Text><Text className="mt-1 text-[11px] text-muted">{product.lastCheckedAt ? `Checked ${formatRelativeTime(product.lastCheckedAt)}` : "Availability not checked"}</Text><Pressable onPress={() => router.push({ pathname: "/product-detail", params: { productId: product.id } })} accessibilityRole="button" accessibilityLabel={`Review ${product.name} freshness`}><Text className="mt-1 text-xs font-semibold text-primary">Review freshness</Text></Pressable><Pressable onPress={() => Linking.openURL(product.merchantUrl)} accessibilityRole="link" accessibilityLabel={`Open ${product.name} merchant page`}><Text className="mt-1 text-xs font-semibold text-primary">View merchant details</Text></Pressable></View><View className="items-end"><Text className="font-semibold text-foreground">{product.owned ? "Owned" : `$${(product.priceCents * quantity / 100).toFixed(0)}`}</Text>{!product.owned && cart.status === "draft" && <View className="mt-2 flex-row items-center gap-2"><Pressable onPress={() => changeQuantity(product.id, quantity - 1)} disabled={busy} accessibilityLabel={`Decrease ${product.name} quantity`} style={({ pressed }) => [{ height: 28, width: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "#EAE7DF" }, pressed && { opacity: 0.65 }]}><Text className="text-base text-foreground">−</Text></Pressable><Text className="min-w-[16px] text-center text-xs font-semibold text-foreground">{quantity}</Text><Pressable onPress={() => changeQuantity(product.id, quantity + 1)} disabled={busy} accessibilityLabel={`Increase ${product.name} quantity`} style={({ pressed }) => [{ height: 28, width: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "#EAE7DF" }, pressed && { opacity: 0.65 }]}><Text className="text-base text-foreground">+</Text></Pressable></View>}</View></View>)}</View>{cart.status === "draft" && replacements.data?.length ? <View className="mt-4 rounded-2xl border border-border bg-surface p-4"><Text className="text-xs font-semibold tracking-[1.2px] text-muted">OTHER OPTIONS</Text><Text className="mt-1 text-sm text-muted">Swap an item before requesting approval.</Text>{replacements.data.map((replacement) => <Pressable key={replacement.id} onPress={() => replaceItem.mutate({ cartId: cart.id!, productId: replacementSeed, replacementId: replacement.id })} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingTop: 12 }, pressed && { opacity: 0.7 }]}><Image source={{ uri: replacement.imageUrl }} className="h-10 w-10 rounded-lg" /><View className="ml-2 flex-1"><Text className="text-sm font-semibold text-foreground">{replacement.name}</Text><Text className="text-xs text-muted">{replacement.brand} · ${(replacement.priceCents / 100).toFixed(0)}</Text></View><Text className="text-xs font-semibold text-primary">Swap</Text></Pressable>)}</View> : null}<View className="mt-6 rounded-2xl bg-[#E8EEE9] p-4"><Text className="text-sm font-semibold text-[#3E5044]">{cart.status === "approved" ? "Draft approved" : cart.status === "awaiting_approval" ? "Approval requested" : "Human approval required"}</Text><Text className="mt-1 text-sm leading-5 text-[#617267]">{cart.status === "approved" ? "The draft is approved for the next merchant step. Checkout and payment remain outside MirrorCart." : "Review the exact items, quantities, prices, and merchant links before approving this draft."}</Text></View>{cart.status === "approved" ? <Pressable onPress={() => router.push("/")} style={{ backgroundColor: "#C9A84C", borderRadius: 16, paddingVertical: 17, alignItems: "center", marginTop: 22 }}><Text className="text-base font-bold text-white">Continue shopping</Text></Pressable> : <Pressable onPress={cart.status === "awaiting_approval" ? handleApprove : handleRequestApproval} disabled={busy || !cart.id || validation.data?.ok === false} style={{ backgroundColor: "#C9A84C", borderRadius: 16, paddingVertical: 17, alignItems: "center", marginTop: 22, opacity: busy || !cart.id || validation.data?.ok === false ? 0.6 : 1 }}><Text className="text-base font-bold text-white">{requestApproval.isPending ? "Securing approval…" : approve.isPending ? "Approving draft…" : cart.status === "awaiting_approval" ? "Approve this draft" : "Request approval"}</Text></Pressable>}</> : <View className="mt-8 rounded-2xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">No draft cart yet</Text><Text className="mt-2 text-sm leading-5 text-muted">Return to a look and choose Shop this look to prepare a reviewable cart.</Text><Pressable onPress={() => router.push("/looks")} style={{ backgroundColor: "#C9A84C", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 18 }}><Text className="font-bold text-white">Browse looks</Text></Pressable></View>}{errorMessage ? <View className="mt-3 rounded-xl border border-[#E5B4AA] bg-[#FFF3EF] px-3 py-2"><Text className="text-xs leading-5 text-[#9B3F32]">{errorMessage}</Text></View> : null}{validation.data?.warnings?.length ? <View className="mt-3 rounded-xl bg-[#F5EDE5] px-3 py-2"><Text className="text-xs leading-5 text-[#8A5D3B]">{validation.data.warnings.join(" · ")}</Text></View> : null}<Text className="mt-3 text-center text-xs leading-5 text-muted">Merchant availability, sizing, shipping, and final payment are confirmed outside the agent.</Text></ScrollView></ScreenContainer>;
}
