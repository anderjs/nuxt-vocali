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
  default     = "vocali-app-table"
}

variable "cognito_user_pool_id" {
  description = "Existing Cognito User Pool ID to use as JWT issuer for API Gateway authorizer"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+_[A-Za-z0-9]+$", var.cognito_user_pool_id))
    error_message = "cognito_user_pool_id must be a valid Cognito User Pool ID."
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

variable "api_log_retention_days" {
  description = "CloudWatch retention period for API Gateway and Lambda logs"
  type        = number
  default     = 14

  validation {
    condition     = var.api_log_retention_days > 0
    error_message = "api_log_retention_days must be greater than 0."
  }
}
