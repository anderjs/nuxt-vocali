import { config } from "../config/index.js";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      service: "vocali-api",
      environment: config.appEnv,
    }),
  };
};
