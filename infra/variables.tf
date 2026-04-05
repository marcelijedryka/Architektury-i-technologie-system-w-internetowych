variable "aws_region" {
  default = "eu-central-1"
}

variable "table_name" {
  default = "archive-table"
}

variable "bucket_name" {
  default = "archive-photos-bucket"
}

variable "frontend_origin" {
  default = "http://localhost:5173"
}
