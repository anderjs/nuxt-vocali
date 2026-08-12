import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyHandlerV2,
  APIGatewayEventRequestContextV2,
} from "aws-lambda";

type AuthClaims = Record<string, string | undefined>;

type Handler = (
  event: APIGatewayProxyEventV2,
  claims: AuthClaims,
) => Promise<APIGatewayProxyResultV2>;

type RequestContext = APIGatewayEventRequestContextV2 & {
  authorizer: {
    jwt: {
      claims: {
        sub: string;
      };
    };
  };
};

export const authHandler = (handler: Handler): APIGatewayProxyHandlerV2 => {
  return async (event) => {
    const claims = (event.requestContext as RequestContext)?.authorizer?.jwt
      ?.claims;

    if (!claims?.sub) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    return handler(event, claims as AuthClaims);
  };
};
