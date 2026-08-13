export function getIdentityLabel(user?: {
  email?: string;
  username?: string;
} | null): string {
  return user?.email ?? user?.username ?? "Usuario";
}

export function getInitials(value: string): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "U";
  }

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
