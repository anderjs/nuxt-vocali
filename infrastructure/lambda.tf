resource "aws_lambda_function" "handlers" {
  for_each = local.lambda_routes

  function_name = "vocali-${each.key}"
  role          = aws_iam_role.lambda_execution_role.arn
  runtime       = var.api_lambda_runtime
  handler       = "${each.value.function_name}.handler"

  filename         = data.archive_file.lambda_packages[each.key].output_path
  source_code_hash = data.archive_file.lambda_packages[each.key].output_base64sha256

  publish = false

  environment {
    variables = merge(
      {
        APP_ENV             = "lambda"
        DYNAMODB_TABLE_NAME = aws_dynamodb_table.app_table.name
        S3_BUCKET_NAME      = aws_s3_bucket.app_bucket.bucket
      },
      each.key == "create-realtime-token" ? {
        SPEECHMATICS_API_KEY = var.speechmatics_api_key
      } : {},
      each.key == "create-transcription" ? {
        PROCESS_TRANSCRIPTION_FUNCTION_NAME = aws_lambda_function.process_transcription.function_name
      } : {},
    )
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    data.archive_file.lambda_packages,
  ]
}

data "archive_file" "lambda_packages" {
  for_each = local.lambda_routes

  type        = "zip"
  source_file = "${path.module}/../server/dist/${each.value.function_name}.js"
  output_path = "${path.module}/build/${each.key}.zip"
}

resource "aws_lambda_permission" "apigw_invoke" {
  for_each = local.lambda_routes

  statement_id  = "AllowAPIGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handlers[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "lambda_handlers" {
  for_each          = local.lambda_routes
  name              = "/aws/lambda/${aws_lambda_function.handlers[each.key].function_name}"
  retention_in_days = var.api_log_retention_days
}

# Internal worker: invoked asynchronously by create-transcription, never exposed via API Gateway.
data "archive_file" "process_transcription_package" {
  type        = "zip"
  source_file = "${path.module}/../server/dist/process-transcription.js"
  output_path = "${path.module}/build/process-transcription.zip"
}

resource "aws_lambda_function" "process_transcription" {
  function_name = "vocali-process-transcription"
  role          = aws_iam_role.lambda_execution_role.arn
  runtime       = var.api_lambda_runtime
  handler       = "process-transcription.handler"
  timeout       = 300
  memory_size   = 512

  filename         = data.archive_file.process_transcription_package.output_path
  source_code_hash = data.archive_file.process_transcription_package.output_base64sha256

  environment {
    variables = {
      APP_ENV              = "lambda"
      DYNAMODB_TABLE_NAME  = aws_dynamodb_table.app_table.name
      S3_BUCKET_NAME       = aws_s3_bucket.app_bucket.bucket
      SPEECHMATICS_API_KEY = var.speechmatics_api_key
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    data.archive_file.process_transcription_package,
  ]
}

resource "aws_cloudwatch_log_group" "process_transcription" {
  name              = "/aws/lambda/${aws_lambda_function.process_transcription.function_name}"
  retention_in_days = var.api_log_retention_days
}
