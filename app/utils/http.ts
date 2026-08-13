import type { UnauthorizedErrorCandidate } from "~/common/types";

export enum HttpStatusCode {
  UNAUTHORIZED = 401,
}

export enum HttpStatusMessage {
  UNAUTHORIZED = "Unauthorized",
}

export enum HttpHeader {
  AUTHORIZATION = "Authorization",
}

export enum AuthorizationScheme {
  BEARER = "Bearer",
}

export function hasHttpStatus(
  error: unknown,
  statusCode: HttpStatusCode,
): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as UnauthorizedErrorCandidate;

  return (
    candidate.status === statusCode ||
    candidate.statusCode === statusCode ||
    candidate.response?.status === statusCode
  );
}

export function getBearerAuthorizationHeader(accessToken: string): string {
  return `${AuthorizationScheme.BEARER} ${accessToken}`;
}
