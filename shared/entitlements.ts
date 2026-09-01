export type EntitlementStatus = "active" | "grace" | "paused" | "cancelled" | "expired" | "unknown";

export type EntitlementState = {
  status: EntitlementStatus;
  capabilities: string[];
  entitlementVersion?: string;
  refreshedAt?: string;
};

export function hasCapability(state: EntitlementState | undefined, capability: string): boolean {
  if (!state || state.status === "expired" || state.status === "cancelled" || state.status === "unknown") return false;
  return state.capabilities.includes(capability);
}

export function entitlementCopy(state: EntitlementState | undefined): string {
  if (!state) return "Access status unavailable. Check again before starting a premium feature.";
  if (state.status === "active") return "Premium access active.";
  if (state.status === "grace") return "Premium access active while billing is resolved.";
  if (state.status === "paused") return "Premium access paused until billing resumes.";
  if (state.status === "cancelled") return "Premium access ends with the current billing period.";
  if (state.status === "expired") return "Premium access has ended.";
  return "Access status unavailable. Check again before starting a premium feature.";
}
