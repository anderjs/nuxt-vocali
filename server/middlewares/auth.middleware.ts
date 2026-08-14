import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyHandlerV2,
} from "aws-lambda";

export interface AuthClaims {
  sub: string;
}

type Handler = (
  event: APIGatewayProxyEventV2,
  claims: AuthClaims,
) => Promise<APIGatewayProxyResultV2>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getAuthClaims(event: APIGatewayProxyEventV2): AuthClaims | null {
  const requestContext = event.requestContext;

  if (!("authorizer" in requestContext)) {
    return null;
  }

  const authorizer = requestContext.authorizer;

  if (!isRecord(authorizer) || !isRecord(authorizer.jwt)) {
    return null;
  }

  const claims = authorizer.jwt.claims;

  if (!isRecord(claims) || typeof claims.sub !== "string" || !claims.sub) {
    return null;
  }

  return { sub: claims.sub };
}

export const authHandler = (handler: Handler): APIGatewayProxyHandlerV2 => {
  return async (event) => {
    const claims = getAuthClaims(event);

    if (!claims) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    return handler(event, claims);
  };
};
