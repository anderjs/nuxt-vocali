import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware";
import { HttpStatusCode } from "../utils/code";
import { transcriptionRepository } from "../repositories/transcription.repository";
import { listTranscriptionsResponseSchema } from "../types/transcription";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  async (_event, claims) => {
    const data = await transcriptionRepository.listTranscriptions(claims.sub!);

    const response = listTranscriptionsResponseSchema.parse({ data });

    return {
      body: JSON.stringify(response),
      statusCode: HttpStatusCode.OK,
    };
  },
);
