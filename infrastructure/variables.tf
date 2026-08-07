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
