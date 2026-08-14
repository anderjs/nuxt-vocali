import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware";
import { createRealtimeTemporaryCredential } from "../services/speechmatics.service";
import { HttpStatusCode } from "../utils/code";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  async (_event, _claims) => {
    try {
      const credential = await createRealtimeTemporaryCredential();

      return {
        body: JSON.stringify(credential),
        statusCode: HttpStatusCode.OK,
      };
    } catch {
      return {
        body: JSON.stringify({
          message: "Unable to create realtime credential",
        }),
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }
  },
);
