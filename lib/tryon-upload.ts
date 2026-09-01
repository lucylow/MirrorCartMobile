import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

export async function uploadMobileImage(uri: string, kind: "user" | "garment" = "user") {
  if (!uri) throw new Error("image_uri_required");
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append("image", blob, `${kind}.jpg`);
  } else {
    form.append("image", { uri, name: `${kind}.jpg`, type: "image/jpeg" } as any);
  }
  form.append("kind", kind);
  const response = await fetch(`${getApiBaseUrl()}/api/upload/image`, { method: "POST", body: form });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || `upload_failed_${response.status}`);
  if (!body?.fileId) throw new Error("upload_file_id_missing");
  return body as { fileId: string };
}
