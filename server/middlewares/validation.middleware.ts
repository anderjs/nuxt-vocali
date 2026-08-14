import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { ZodError, type z } from "zod";
import { HttpStatusCode } from "../utils/code";
import { parseJsonBody, parseParams } from "../utils/validation";

type RequestSchema = z.ZodType;

export interface RequestValidationSchemas {
  body?: RequestSchema;
  params?: RequestSchema;
  query?: RequestSchema;
}

type InferSchema<TSchema extends RequestSchema | undefined> =
  TSchema extends RequestSchema ? z.infer<TSchema> : undefined;

export interface ValidatedRequest<TSchemas extends RequestValidationSchemas> {
  body: InferSchema<TSchemas["body"]>;
  params: InferSchema<TSchemas["params"]>;
  query: InferSchema<TSchemas["query"]>;
}

type Handler<
  TArguments extends unknown[],
  TSchemas extends RequestValidationSchemas,
> = (
  event: APIGatewayProxyEventV2,
  request: ValidatedRequest<TSchemas>,
  ...arguments_: TArguments
) => Promise<APIGatewayProxyResultV2>;

function validateRequest<TSchemas extends RequestValidationSchemas>(
  event: APIGatewayProxyEventV2,
  schemas: TSchemas,
): ValidatedRequest<TSchemas> {
  const request = {} as ValidatedRequest<TSchemas>;

  if (schemas?.body) {
    request.body = parseJsonBody(
      schemas.body,
      event.body,
    ) as ValidatedRequest<TSchemas>["body"];
  }

  if (schemas?.params) {
    request.params = parseParams(
      schemas.params,
      event.pathParameters ?? {},
    ) as ValidatedRequest<TSchemas>["params"];
  }

  if (schemas?.query) {
    request.query = parseParams(
      schemas.query,
      event.queryStringParameters ?? {},
    ) as ValidatedRequest<TSchemas>["query"];
  }

  return request;
}

export function withValidation<
  TSchemas extends RequestValidationSchemas,
  TArguments extends unknown[],
>(
  schemas: TSchemas,
  handler: Handler<TArguments, TSchemas>,
): (
  event: APIGatewayProxyEventV2,
  ...arguments_: TArguments
) => Promise<APIGatewayProxyResultV2> {
  return async (event, ...arguments_) => {
    let request: ValidatedRequest<TSchemas>;

    try {
      request = validateRequest(event, schemas);
    } catch (error) {
      if (error instanceof ZodError || error instanceof SyntaxError) {
        return {
          body: JSON.stringify({ message: "Invalid request" }),
          statusCode: HttpStatusCode.BAD_REQUEST,
        };
      }

      throw error;
    }

    return handler(event, request, ...arguments_);
  };
}
