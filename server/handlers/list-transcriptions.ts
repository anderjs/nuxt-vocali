import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware";
import { HttpStatusCode } from "../utils/code";
import { transcriptionRepository } from "../repositories/transcription.repository";
import {
  listTranscriptionsQuerySchema,
  listTranscriptionsResponseSchema,
} from "../types/transcription";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  async (event, claims) => {
    const query = listTranscriptionsQuerySchema.parse(
      event.queryStringParameters ?? {},
    );
    const page = await transcriptionRepository.listTranscriptions(
      claims.sub!,
      query,
    );

    const response = listTranscriptionsResponseSchema.parse(page);

    return {
      body: JSON.stringify(response),
      statusCode: HttpStatusCode.OK,
    };
  },
);
