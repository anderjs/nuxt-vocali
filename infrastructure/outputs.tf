output "bucket_name" {
  description = "Name of the created S3 bucket"
  value       = aws_s3_bucket.app_bucket.bucket
}

output "bucket_arn" {
  description = "ARN of the created S3 bucket"
  value       = aws_s3_bucket.app_bucket.arn
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.app_table.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.app_table.arn
}

output "api_gateway_http_api_id" {
  description = "ID of the HTTP API Gateway"
  value       = aws_apigatewayv2_api.http_api.id
}

output "api_gateway_endpoint" {
  description = "Invoke URL for the HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "lambda_function_names" {
  description = "Created Lambda handler names"
  value       = [for fn in aws_lambda_function.handlers : fn.function_name]
}

output "api_cognito_authorizer_id" {
  description = "Cognito JWT authorizer ID"
  value       = aws_apigatewayv2_authorizer.cognito_jwt.id
}
