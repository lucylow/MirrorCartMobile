export type NetworkSnapshot = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
};

/**
 * Treat only an explicit disconnected or unreachable state as offline.
 * Unknown startup values remain neutral to avoid flashing a misleading warning.
 */
export function isOfflineNetworkState(state: NetworkSnapshot): boolean {
  return state.isInternetReachable === false || state.isConnected === false;
}
