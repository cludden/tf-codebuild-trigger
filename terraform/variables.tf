variable "additional_parameter_names" {
  type        = "string"
  description = "comma separated list of ssm parameter names"
  default     = ""
}

variable "config_parameter_name" {
  type        = "string"
  description = "name of terraform managed ssm parameter"
}

variable "debug" {
  type        = "string"
  description = "node debug flag"
  default     = ""
}

variable "memory_size" {
  type        = "string"
  description = "lambda function memory limit"
  default     = 128
}

variable "name" {
  type        = "string"
  description = "stack name"
}

variable "node_env" {
  type        = "string"
  description = "node environment"
  default     = "production"
}

variable "region" {
  type        = "string"
  description = "aws region"
}

variable "s3_bucket" {
  type        = "string"
  description = "lambda artifact s3 bucket name"
}

variable "s3_key" {
  type        = "string"
  description = "lambda artifact s3 key"
}

variable "sns_topic_arn" {
  type        = "string"
  description = "arn of github topic"
}

variable "timeout" {
  type        = "string"
  description = "lambda function timeout"
  default     = 10
}
