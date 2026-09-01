import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { userFacingError } from "@/lib/utils";
import type { StylingSession } from "@/shared/types";
import { uploadMobileImage } from "@/lib/tryon-upload";
import { GoldButton, SerifTitle, mirrorPalette } from "@/components/mirror-ui";

export default function TryOnScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string>();
  const [taskId, setTaskId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const cameraRef = useRef<CameraView>(null);
  const params = useLocalSearchParams<{ session?: string; lookId?: string }>();
  const session = useMemo<StylingSession | null>(() => { try { return params.session ? JSON.parse(params.session) : null; } catch { return null; } }, [params.session]);
  const tryOn = trpc.styling.tryOn.useMutation();
  const pollTryOn = trpc.styling.pollTryOn.useQuery({ sessionId: session?.id ?? "", lookId: params.lookId ?? "", taskId: taskId ?? "" }, { enabled: Boolean(taskId && session?.id && params.lookId), refetchInterval: 1500 });

  useEffect(() => {
    if (pollTryOn.data?.status === "ready" && session && params.lookId) {
      router.push({ pathname: "/look-detail", params: { session: JSON.stringify(session), lookId: params.lookId, previewUrl: pollTryOn.data.previewUrl } });
      setTaskId(undefined);
    }
  }, [pollTryOn.data, session, params.lookId]);

  useEffect(() => {
    if (pollTryOn.error) {
      setTaskId(undefined);
      setErrorMessage(userFacingError(pollTryOn.error, "The visualization expired before it finished. Try creating it again."));
    }
  }, [pollTryOn.error]);

  async function chooseFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function capture() {
    if (Platform.OS === "web") return chooseFromLibrary();
    const result = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
    if (result?.uri) setPhotoUri(result.uri);
  }

  async function createPreview() {
    if (!session || !params.lookId || !photoUri) return;
    setErrorMessage(undefined);
    try {
      const upload = await uploadMobileImage(photoUri, "user");
      const result = await tryOn.mutateAsync({ sessionId: session.id, lookId: params.lookId, photoUri, sourceFileId: upload.fileId });
      if (result.status === "ready") router.push({ pathname: "/look-detail", params: { session: JSON.stringify(session), lookId: params.lookId, previewUrl: result.previewUrl } });
      else if (result.taskId) setTaskId(result.taskId);
    } catch (error) {
      setErrorMessage(userFacingError(error, "Unable to create the preview. Try again."));
    }
  }

  if (!session || !params.lookId) return <ScreenContainer className="items-center justify-center px-8"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#F2EFE8]"><IconSymbol name="sparkles" size={28} color={mirrorPalette.gold} /></View><Text className="mt-5 text-center text-2xl text-foreground" style={{ fontFamily: "Georgia" }}>This edit needs a fresh start</Text><Text className="mt-3 text-center text-base leading-6 text-muted">The styling session is missing or expired. Return Home to create a new look before opening Try On.</Text><GoldButton onPress={() => router.replace("/")} style={{ marginTop: 24, paddingHorizontal: 28 }}><Text className="font-bold text-white">Start a new edit</Text></GoldButton></ScreenContainer>;

  if (!permission?.granted && Platform.OS !== "web" && !photoUri) return <ScreenContainer className="items-center justify-center px-8"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#E8EEE9]"><IconSymbol name="camera.fill" size={28} color={mirrorPalette.sage} /></View><Text className="mt-5 text-center text-2xl font-bold text-foreground">A quick photo, then the magic</Text><Text className="mt-3 text-center text-base leading-6 text-muted">MirrorCart uses a full-body photo to create a visual preview of your look.</Text><GoldButton onPress={requestPermission} style={{ marginTop: 24, paddingHorizontal: 28 }}><Text className="font-bold text-white">Allow camera</Text></GoldButton><Pressable onPress={chooseFromLibrary} style={{ padding: 16, marginTop: 8 }}><Text className="font-semibold text-primary">Choose from library</Text></Pressable></ScreenContainer>;

  return <ScreenContainer className="px-5" edges={["top", "left", "right", "bottom"]}><View className="flex-1"><View className="flex-row items-center justify-between pt-3"><View><Text className="text-xs font-semibold tracking-[2px] text-primary">TRY ON</Text><SerifTitle style={{ marginTop: 7 }}>Frame the full look</SerifTitle></View><Pressable onPress={() => router.back()}><IconSymbol name="xmark" size={24} color="#1E1D1A" /></Pressable></View><Text className="mt-3 text-base text-muted">Keep your full body visible, stand in clear light, and make sure you’re the only person in frame.</Text><View className="mt-6 flex-1 overflow-hidden rounded-[28px] bg-[#242321]">{photoUri ? <Image source={{ uri: photoUri }} className="flex-1" resizeMode="cover" /> : permission?.granted && Platform.OS !== "web" ? <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" /> : <View className="flex-1 items-center justify-center"><IconSymbol name="image" size={38} color="#B8B1A5" /><Text className="mt-3 text-sm text-[#B8B1A5]">Choose a photo to continue</Text></View>}{taskId && <View className="absolute top-4 left-4 right-4 rounded-2xl bg-black/65 px-4 py-3"><Text className="font-semibold text-white">Preparing your visualization…</Text><Text className="mt-1 text-xs text-white/80">We’ll move you forward when the provider finishes.</Text></View>}<View className="absolute inset-5 rounded-[24px] border-2 border-white/70" style={{ zIndex: 2 }}><View className="absolute bottom-5 left-0 right-0 items-center"><View className="rounded-full bg-black/50 px-4 py-2"><Text className="text-xs font-semibold text-white">FULL BODY IN FRAME</Text></View></View></View></View>{errorMessage && <View className="rounded-2xl border border-[#E5B4AA] bg-[#FFF3EF] px-4 py-3"><Text className="text-sm font-semibold text-[#9B3F32]">Preview unavailable</Text><Text className="mt-1 text-xs leading-5 text-[#9B3F32]">{errorMessage}</Text><Pressable onPress={createPreview} style={{ marginTop: 8 }}><Text className="text-sm font-bold text-[#9B3F32]">Try again</Text></Pressable></View>}<View className="flex-row gap-3 py-5"><Pressable onPress={chooseFromLibrary} style={({ pressed }) => [{ flex: 1, borderRadius: 15, borderWidth: 1, borderColor: "#E8E2D8", paddingVertical: 15, alignItems: "center" }, pressed && { opacity: 0.7 }]}><Text className="font-semibold text-foreground">Library</Text></Pressable><Pressable onPress={photoUri ? createPreview : capture} disabled={tryOn.isPending} style={({ pressed }) => [{ flex: 1.5, borderRadius: 15, backgroundColor: mirrorPalette.gold, paddingVertical: 15, alignItems: "center" }, pressed && { opacity: 0.85 }, tryOn.isPending && { opacity: 0.6 }]}><Text className="font-bold text-white">{tryOn.isPending ? "Preparing preview…" : photoUri ? "Create preview" : "Capture photo"}</Text></Pressable></View></View></ScreenContainer>;
}
