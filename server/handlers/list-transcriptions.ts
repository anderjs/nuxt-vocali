import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware.js";
import { HttpStatusCode } from "../utils/code.js";

export const handler: APIGatewayProxyHandlerV2 = authHandler(async () => {
  return {
    body: JSON.stringify({
      data: [],
    }),
    statusCode: HttpStatusCode.OK,
  };
});
