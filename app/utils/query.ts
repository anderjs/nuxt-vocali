import type { OAuthCallbackLocation, QueryValue } from "~/common/types";

/**
 * @description
 * Query value.
 */
export function getQueryValue(
  value: QueryValue,
  index: number = 0,
): string | undefined {
  const firstValue = Array.isArray(value) ? value[index] : value;

  return firstValue ?? undefined;
}

/**
 * Checks whether the current browser location is a Cognito OAuth callback.
 */
export function isOAuthCallbackUrl(
  location: OAuthCallbackLocation,
  redirectUri: string,
): boolean {
  const redirectPath = new URL(redirectUri).pathname;
  const callbackParams = new URLSearchParams(location.search);

  return (
    location.pathname === redirectPath &&
    (callbackParams.has("code") || callbackParams.has("error"))
  );
}
