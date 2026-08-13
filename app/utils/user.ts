import type { AuthIdentityUser } from "~/common/types";

export function getIdentityLabel(
  user?: AuthIdentityUser | null,
): string {
  return user?.email ?? user?.username ?? "Usuario";
}

/**
 * @description
 * Get initials from text.
 */
export function getInitials(value: string): string {
  const normalizedValue = value?.trim();

  if (normalizedValue.includes("@")) {
    return normalizedValue.charAt(0).toUpperCase();
  }

  return normalizedValue
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}
