export type ApprovalRecoveryAction = "request" | "approve" | "restore";

export function approvalRecoveryAction(status: string | undefined, hasToken: boolean, expired: boolean): ApprovalRecoveryAction {
  if (status !== "awaiting_approval") return "request";
  if (expired || !hasToken) return "restore";
  return "approve";
}

export function approvalRecoveryLabel(action: ApprovalRecoveryAction): string {
  if (action === "restore") return "Restore approval";
  if (action === "approve") return "Approve this draft";
  return "Request approval";
}
