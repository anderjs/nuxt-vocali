locals {
  lambda_routes = {
    health = {
      function_name = "health"
      route_key     = "GET /health"
      protected     = false
    }
    "create-upload-url" = {
      function_name = "create-upload-url"
      route_key     = "POST /upload-url"
      protected     = true
    }
    "create-transcription" = {
      function_name = "create-transcription"
      route_key     = "POST /transcriptions"
      protected     = true
    }
    "list-transcriptions" = {
      function_name = "list-transcriptions"
      route_key     = "GET /transcriptions"
      protected     = true
    }
    "get-transcription" = {
      function_name = "get-transcription"
      route_key     = "GET /transcriptions/{id}"
      protected     = true
    }
    "download-transcription" = {
      function_name = "download-transcription"
      route_key     = "GET /transcriptions/{id}/download"
      protected     = true
    }
  }

  cognito_user_pool_client_id = data.aws_cognito_user_pool_clients.app_clients.client_ids[0]
  cognito_issuer              = "https://cognito-idp.${var.aws_region}.amazonaws.com/${data.aws_cognito_user_pool.app_pool.id}"
}

data "aws_cognito_user_pool" "app_pool" {
  user_pool_id = var.cognito_user_pool_id
}

data "aws_cognito_user_pool_clients" "app_clients" {
  user_pool_id = data.aws_cognito_user_pool.app_pool.id
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "vocali-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_authorizer" "cognito_jwt" {
  api_id           = aws_apigatewayv2_api.http_api.id
  name             = "vocali-cognito-jwt-authorizer"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [local.cognito_user_pool_client_id]
    issuer   = local.cognito_issuer
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  for_each = local.lambda_routes

  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.handlers[each.key].invoke_arn
  payload_format_version = "2.0"
  integration_method     = "POST"
}

resource "aws_apigatewayv2_route" "routes" {
  for_each = local.lambda_routes

  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = each.value.route_key
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"

  authorization_type = each.value.protected ? "JWT" : "NONE"
  authorizer_id      = each.value.protected ? aws_apigatewayv2_authorizer.cognito_jwt.id : null
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_access_logs.arn
    format = jsonencode({
      request_id      = "$context.requestId"
      ip              = "$context.identity.sourceIp"
      request_time    = "$context.requestTime"
      http_method     = "$context.httpMethod"
      route_key       = "$context.routeKey"
      status          = "$context.status"
      response_length = "$context.responseLength"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_access_logs" {
  name              = "/aws/apigateway/vocali-http-api"
  retention_in_days = var.api_log_retention_days
}
