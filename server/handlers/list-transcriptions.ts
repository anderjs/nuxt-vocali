import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware";
import { HttpStatusCode } from "../utils/code";
import {
  listTranscriptionsQuerySchema,
  listTranscriptionsResponseSchema,
} from "../types/transcription";
import { withValidation } from "../middlewares/validation.middleware";
import { transcriptionRepository } from "../repositories/transcription.repository";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  withValidation(
    { query: listTranscriptionsQuerySchema },
    async (_event, request, claims) => {
      const page = await transcriptionRepository.listTranscriptions(
        claims.sub,
        request.query,
      );

      const response = listTranscriptionsResponseSchema.parse(page);

      return {
        body: JSON.stringify(response),
        statusCode: HttpStatusCode.OK,
      };
    },
  ),
);
