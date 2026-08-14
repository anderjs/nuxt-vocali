import "dotenv/config";

export const config = {
  appEnv: process.env.APP_ENV ?? "server",
  nodeEnv: process.env.NODE_ENV ?? "production",
  awsRegion: process.env.AWS_REGION ?? "eu-west-1",
  speechmaticsApiUrl:
    process.env.SPEECHMATICS_API_URL ?? "https://asr.api.speechmatics.com",
  speechmaticsApiKey: process.env.SPEECHMATICS_API_KEY,
  speechmaticsApiTimeoutMs: Number(
    process.env.SPEECHMATICS_API_TIMEOUT_MS ?? 15000,
  ),
  logLevel: process.env.LOG_LEVEL ?? "info",
  s3BucketName: process.env.S3_BUCKET_NAME,
  dynamodbTableName: process.env.DYNAMODB_TABLE_NAME,
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  processTranscriptionFunctionName: process.env.PROCESS_TRANSCRIPTION_FUNCTION_NAME,
};
