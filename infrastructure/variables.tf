variable "aws_region" {
  description = "AWS region for the resources"
  type        = string
  default     = "eu-north-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
  default     = "vocali-s3"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
  default     = "transcriptions"
}

variable "cognito_user_pool_id" {
  description = "Existing Cognito User Pool ID to use as JWT issuer for API Gateway authorizer"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+_[A-Za-z0-9]+$", var.cognito_user_pool_id))
    error_message = "cognito_user_pool_id must be a valid Cognito User Pool ID."
  }
}


variable "cognito_user_pool_client_id" {
  description = "Existing Cognito User Pool App Client ID to import/manage for Hosted UI OAuth settings"
  type        = string

  validation {
    condition     = length(trimspace(var.cognito_user_pool_client_id)) > 0
    error_message = "cognito_user_pool_client_id must not be empty."
  }
}

variable "cognito_user_pool_client_name" {
  description = "Name of the existing Cognito User Pool App Client. Must match the imported client to avoid renaming it."
  type        = string
}

variable "cognito_domain_prefix" {
  description = "Globally unique Cognito managed-login domain prefix"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$", var.cognito_domain_prefix))
    error_message = "cognito_domain_prefix must be a valid Cognito domain prefix using lowercase letters, numbers, and hyphens."
  }
}

variable "cognito_callback_urls" {
  description = "Allowed OAuth callback URLs for the Cognito App Client"
  type        = list(string)
  default     = ["http://localhost:3000/auth/callback"]
}

variable "cognito_logout_urls" {
  description = "Allowed logout redirect URLs for the Cognito App Client"
  type        = list(string)
  default     = ["http://localhost:3000/login"]
}

variable "google_client_id" {
  description = "Google OAuth client ID used by Cognito federation"
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth client secret used by Cognito federation"
  type        = string
  sensitive   = true
}

variable "google_attribute_mapping" {
  description = "Mapping from Cognito attributes to Google OAuth/OIDC claims"
  type        = map(string)
  default = {
    email       = "email"
    username    = "sub"
    name        = "name"
    family_name = "family_name"
    middle_name = "given_name"
    picture     = "picture"
    profile     = "picture"
    gender      = "sub"
    updated_at  = "iat"
  }
}

variable "api_lambda_runtime" {
  description = "Lambda runtime for HTTP API handlers"
  type        = string
  default     = "nodejs20.x"

  validation {
    condition     = can(regex("^nodejs[0-9]+\\.x$", var.api_lambda_runtime))
    error_message = "api_lambda_runtime must be a valid Lambda Node.js runtime version such as nodejs20.x."
  }
}

variable "speechmatics_api_key" {
  description = "Permanent Speechmatics API key used only by the realtime credential Lambda"
  type        = string
  sensitive   = true

  validation {
    condition     = length(trimspace(var.speechmatics_api_key)) > 0
    error_message = "speechmatics_api_key must not be empty."
  }
}

variable "api_log_retention_days" {
  description = "CloudWatch retention period for API Gateway and Lambda logs"
  type        = number
  default     = 14

  validation {
    condition     = var.api_log_retention_days > 0
    error_message = "api_log_retention_days must be greater than 0."
  }
}


variable "api_cors_allowed_origins" {
  description = "Allowed browser origins for API Gateway CORS"
  type        = list(string)
  default = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]
}
