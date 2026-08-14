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


output "cognito_user_pool_id" {
  description = "Existing Cognito User Pool ID used by the application"
  value       = data.aws_cognito_user_pool.app_pool.id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool App Client ID used by the application"
  value       = aws_cognito_user_pool_client.app_client.id
}

output "cognito_issuer" {
  description = "OIDC issuer URL for the Cognito User Pool"
  value       = local.cognito_issuer
}

output "cognito_managed_login_domain" {
  description = "Cognito managed-login domain"
  value       = "https://${aws_cognito_user_pool_domain.managed_login.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "cognito_managed_login_host" {
  description = "Cognito managed-login host for NUXT_PUBLIC_COGNITO_DOMAIN"
  value       = "${aws_cognito_user_pool_domain.managed_login.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "cognito_oauth_callback_urls" {
  description = "Configured Cognito OAuth callback URLs"
  value       = aws_cognito_user_pool_client.app_client.callback_urls
}

output "cognito_oauth_logout_urls" {
  description = "Configured Cognito OAuth logout URLs"
  value       = aws_cognito_user_pool_client.app_client.logout_urls
}

output "google_oauth_authorized_redirect_uri" {
  description = "Redirect URI that must be configured in Google Cloud Console for Cognito federation"
  value       = "https://${aws_cognito_user_pool_domain.managed_login.domain}.auth.${var.aws_region}.amazoncognito.com/oauth2/idpresponse"
}

output "frontend_bucket_name" {
  description = "Private S3 bucket that receives generated Nuxt static files"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_distribution_id" {
  description = "CloudFront distribution ID to invalidate after a frontend upload"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_url" {
  description = "Default HTTPS URL for the production Nuxt frontend"
  value       = local.frontend_url
}
