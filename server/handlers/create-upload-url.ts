import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  createUploadUrlRequestSchema,
  createUploadUrlResponseSchema,
} from "../types/transcription";
import { s3Service } from "../services/s3.service";

import { authHandler } from "../middlewares/auth.middleware";
import { HttpStatusCode } from "../utils/code";
import { withValidation } from "../middlewares/validation.middleware";

export const handler: APIGatewayProxyHandlerV2 = authHandler(
  withValidation(
    { body: createUploadUrlRequestSchema },
    async (_event, request, claims) => {
      const upload = await s3Service.createUploadUrl({
        userId: claims.sub!,
        fileName: request.body.fileName,
        contentType: request.body.contentType,
      });

      const response = createUploadUrlResponseSchema.parse(upload);

      return {
        body: JSON.stringify(response),
        statusCode: HttpStatusCode.OK,
      };
    },
  ),
);
