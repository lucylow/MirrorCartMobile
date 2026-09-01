import { isOfflineNetworkState, type NetworkSnapshot } from "./network-status";

export type NetworkBannerPresentation = {
  visible: boolean;
  kind: "offline" | "reconnected" | "hidden";
  title: string;
  message: string;
  accessibilityLabel: string;
};

export function getNetworkBannerPresentation(state: NetworkSnapshot, wasOffline = false, refreshComplete = false): NetworkBannerPresentation {
  const offline = isOfflineNetworkState(state);
  if (offline) {
    return {
      visible: true,
      kind: "offline",
      title: "Offline mode",
      message: "Live catalog updates and approval requests are paused. Your current draft remains available here.",
      accessibilityLabel: "Offline mode. Live catalog updates and approval requests are paused.",
    };
  }
  if (wasOffline && state.isConnected === true && state.isInternetReachable === true) {
    return {
      visible: true,
      kind: "reconnected",
      title: "Back online",
      message: refreshComplete ? "Live catalog and inventory data are up to date. Review your draft when ready." : "Refreshing live catalog and inventory data now. Review your draft after it completes.",
      accessibilityLabel: refreshComplete ? "Back online. Live catalog and inventory data are up to date." : "Back online. Live catalog and inventory data are refreshing now.",
    };
  }
  return { visible: false, kind: "hidden", title: "", message: "", accessibilityLabel: "" };
}
