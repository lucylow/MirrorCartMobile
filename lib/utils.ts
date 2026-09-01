import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 * This ensures Tailwind classes are properly merged without conflicts.
 *
 * Usage:
 * ```tsx
 * cn("px-4 py-2", isActive && "bg-primary", className)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const USER_SAFE_ERROR_TERMS = ["approval", "draft", "inventory", "availability", "budget", "session", "preview", "quantity", "replacement", "expired", "available"];

export function userFacingError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message.trim() : "";
  if (!message) return fallback;
  const normalized = message.toLowerCase();
  if (!USER_SAFE_ERROR_TERMS.some((term) => normalized.includes(term))) return fallback;
  return message.length > 180 ? `${message.slice(0, 179)}…` : message;
}
