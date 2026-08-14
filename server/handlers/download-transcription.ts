import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware";
import { withValidation } from "../middlewares/validation.middleware";
import {
  downloadTranscriptionResponseSchema,
  transcriptionIdParamsSchema,
} from "../types/transcription";
import {
  TranscriptionNotFoundError,
  TranscriptionNotReadyForDownloadError,
  transcriptionDownloadService,
} from "../services/transcription-download.service";
import { HttpStatusCode } from "../utils/code";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  withValidation(
    { params: transcriptionIdParamsSchema },
    async (_event, request, claims) => {
      try {
        const downloadUrl = await transcriptionDownloadService.createDownloadUrl(
          claims.sub,
          request.params.id,
        );
        const response = downloadTranscriptionResponseSchema.parse({
          downloadUrl,
        });

        return {
          body: JSON.stringify(response),
          statusCode: HttpStatusCode.OK,
        };
      } catch (error) {
        if (error instanceof TranscriptionNotFoundError) {
          return {
            body: JSON.stringify({ message: "Transcription not found" }),
            statusCode: HttpStatusCode.NOT_FOUND,
          };
        }

        if (error instanceof TranscriptionNotReadyForDownloadError) {
          return {
            body: JSON.stringify({ message: "Transcription is not ready" }),
            statusCode: HttpStatusCode.CONFLICT,
          };
        }

        return {
          body: JSON.stringify({ message: "Unable to prepare download" }),
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        };
      }
    },
  ),
);
