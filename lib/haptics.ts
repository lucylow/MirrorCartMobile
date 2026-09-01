import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Haptics are optional enhancement; visual status copy remains the primary feedback. */
export function notifySuccessHaptic(): void {
  if (Platform.OS !== "web") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }
}
