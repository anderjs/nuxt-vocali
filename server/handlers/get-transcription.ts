import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware";
import { withValidation } from "../middlewares/validation.middleware";
import {
  getTranscriptionResponseSchema,
  transcriptionIdParamsSchema,
} from "../types/transcription";
import {
  TranscriptionDetailNotFoundError,
  transcriptionDetailService,
} from "../services/transcription-detail.service";
import { HttpStatusCode } from "../utils/code";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  withValidation(
    { params: transcriptionIdParamsSchema },
    async (_event, request, claims) => {
      try {
        const transcription = await transcriptionDetailService.getTranscription(
          claims.sub,
          request.params.id,
        );

        return {
          body: JSON.stringify(
            getTranscriptionResponseSchema.parse({ transcription }),
          ),
          statusCode: HttpStatusCode.OK,
        };
      } catch (error) {
        if (error instanceof TranscriptionDetailNotFoundError) {
          return {
            body: JSON.stringify({ message: "Not found" }),
            statusCode: HttpStatusCode.NOT_FOUND,
          };
        }

        return {
          body: JSON.stringify({ message: "Unable to get transcription" }),
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        };
      }
    },
  ),
);
