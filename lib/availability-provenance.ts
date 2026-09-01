import type { Product } from "../shared/types";

export type AvailabilityProvenance = {
  label: string;
  accessibilityLabel: string;
  trustedForApproval: boolean;
};

export function availabilityProvenance(product: Pick<Product, "dataSource" | "lastCheckedAt">): AvailabilityProvenance {
  const hasTimestamp = Boolean(product.lastCheckedAt && Number.isFinite(Date.parse(product.lastCheckedAt)));

  if (product.dataSource === "api" && hasTimestamp) {
    return {
      label: "Live merchant check",
      accessibilityLabel: "Live merchant check",
      trustedForApproval: true,
    };
  }

  if (product.dataSource === "cache") {
    return {
      label: "Cached inventory · confirm with merchant",
      accessibilityLabel: "Cached inventory. Confirm with the merchant before approving.",
      trustedForApproval: false,
    };
  }

  if (product.dataSource === "seed") {
    return {
      label: "Demo availability · confirm with merchant",
      accessibilityLabel: "Demo availability. Confirm with the merchant before approving.",
      trustedForApproval: false,
    };
  }

  return {
    label: "Availability not verified",
    accessibilityLabel: "Availability has not been verified. Confirm with the merchant before approving.",
    trustedForApproval: false,
  };
}
