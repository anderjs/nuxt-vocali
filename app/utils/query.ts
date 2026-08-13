/**
 * @description
 * Query value.
 */
export function getQueryValue(
  value: string | null | (string | null)[] | undefined,
  index: number = 0,
): string | undefined {
  const firstValue = Array.isArray(value) ? value[index] : value;

  return firstValue ?? undefined;
}

/**
 * Checks whether the current browser location is a Cognito OAuth callback.
 */
export function isOAuthCallbackUrl(
  location: Pick<Location, "pathname" | "search">,
  redirectUri: string,
): boolean {
  const callbackParams = new URLSearchParams(location.search);
  const redirectPath = new URL(redirectUri).pathname;

  return (
    location.pathname === redirectPath &&
    (callbackParams.has("code") || callbackParams.has("error"))
  );
}
