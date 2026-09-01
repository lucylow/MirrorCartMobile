export type WardrobePersistenceState = "hydrating" | "saved" | "saving" | "unavailable";

export function wardrobePersistenceCopy(state: WardrobePersistenceState): { label: string; accessibilityLabel: string } {
  switch (state) {
    case "saving":
      return { label: "Saving on this device…", accessibilityLabel: "Saving wardrobe changes on this device" };
    case "unavailable":
      return { label: "Device storage unavailable", accessibilityLabel: "Device storage is unavailable; wardrobe changes may not persist" };
    case "hydrating":
      return { label: "Loading local wardrobe…", accessibilityLabel: "Loading the local wardrobe" };
    default:
      return { label: "Saved on this device", accessibilityLabel: "Wardrobe changes are saved on this device" };
  }
}
