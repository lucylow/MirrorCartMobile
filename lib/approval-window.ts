export type ApprovalWindow = {
  label: string;
  accessibilityLabel: string;
  expired: boolean;
};

export function approvalWindow(expiresAt: string | undefined, now = Date.now()): ApprovalWindow {
  if (!expiresAt) return { label: "Approval window unavailable", accessibilityLabel: "Approval window unavailable.", expired: false };
  const expires = Date.parse(expiresAt);
  if (!Number.isFinite(expires)) return { label: "Approval window unavailable", accessibilityLabel: "Approval window unavailable.", expired: false };
  const remainingMs = expires - now;
  if (remainingMs <= 0) return { label: "Approval expired", accessibilityLabel: "Approval expired. Request a fresh approval after reviewing the draft again.", expired: true };
  if (remainingMs < 60_000) {
    const remainingSeconds = Math.ceil(remainingMs / 1_000);
    return { label: `Approval active · about ${remainingSeconds} seconds left`, accessibilityLabel: `Approval active. About ${remainingSeconds} seconds left.`, expired: false };
  }
  const remainingMinutes = Math.ceil(remainingMs / 60_000);
  const unit = remainingMinutes === 1 ? "minute" : "minutes";
  return { label: `Approval active · about ${remainingMinutes} ${unit} left`, accessibilityLabel: `Approval active. About ${remainingMinutes} ${unit} left.`, expired: false };
}
