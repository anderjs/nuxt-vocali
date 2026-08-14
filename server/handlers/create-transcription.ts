import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { authHandler } from "../middlewares/auth.middleware";
import { withValidation } from "../middlewares/validation.middleware";
import {
  createTranscriptionRequestSchema,
  createTranscriptionResponseSchema,
} from "../types/transcription";
import {
  InvalidUploadObjectKeyError,
  transcriptionService,
} from "../services/transcription.service";
import { HttpStatusCode } from "../utils/code";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  withValidation(
    { body: createTranscriptionRequestSchema },
    async (_event, request, claims) => {
      try {
        const transcription =
          await transcriptionService.createFileTranscription(
            claims.sub!,
            request.body,
          );

        const response = createTranscriptionResponseSchema.parse({
          transcription,
        });

        return {
          body: JSON.stringify(response),
          statusCode: HttpStatusCode.CREATED,
        };
      } catch (error) {
        if (error instanceof InvalidUploadObjectKeyError) {
          return {
            body: JSON.stringify({ message: "Invalid upload" }),
            statusCode: HttpStatusCode.BAD_REQUEST,
          };
        }

        return {
          body: JSON.stringify({ message: "Unable to create transcription" }),
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        };
      }
    },
  ),
);
