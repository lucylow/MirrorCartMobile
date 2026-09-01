import { formatRelativeTime } from "./relative-time";

export function availabilityFreshnessLabel(lastCheckedAt?: string, now = Date.now()): string {
  if (!lastCheckedAt || !Number.isFinite(Date.parse(lastCheckedAt))) {
    return "Availability not checked";
  }

  return `Availability checked ${formatRelativeTime(lastCheckedAt, now)}`;
}

export function availabilityFreshnessAccessibilityLabel(lastCheckedAt?: string, now = Date.now()): string {
  return availabilityFreshnessLabel(lastCheckedAt, now);
}

export function isAvailabilityFreshnessKnown(lastCheckedAt?: string): boolean {
  return Boolean(lastCheckedAt && Number.isFinite(Date.parse(lastCheckedAt)));
}

export function formatAvailabilityFreshness(lastCheckedAt?: string, now = Date.now()): {
  label: string;
  accessibilityLabel: string;
  known: boolean;
} {
  const known = isAvailabilityFreshnessKnown(lastCheckedAt);
  const label = availabilityFreshnessLabel(lastCheckedAt, now);
  return {
    label,
    accessibilityLabel: availabilityFreshnessAccessibilityLabel(lastCheckedAt, now),
    known,
  };
}

export const availabilityFreshness = formatAvailabilityFreshness;
