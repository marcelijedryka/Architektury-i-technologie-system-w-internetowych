terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

provider "aws" {
  region = var.aws_region
}

# ── DynamoDB ──────────────────────────────────────────────
resource "aws_dynamodb_table" "archive" {
  name         = "${var.table_name}-${random_id.suffix.hex}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }
  attribute {
    name = "cityId"
    type = "S"
  }
  attribute {
    name = "regionId"
    type = "S"
  }
  attribute {
    name = "uploadedBy"
    type = "S"
  }
  attribute {
    name = "uploadedAt"
    type = "S"
  }

  global_secondary_index {
    name            = "ByCity"
    hash_key        = "cityId"
    range_key       = "uploadedAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "ByRegion"
    hash_key        = "regionId"
    range_key       = "uploadedAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "ByUploader"
    hash_key        = "uploadedBy"
    range_key       = "uploadedAt"
    projection_type = "ALL"
  }

  tags = { Project = "digital-archive" }
}

# ── S3 ────────────────────────────────────────────────────
resource "aws_s3_bucket" "photos" {
  bucket = "${var.bucket_name}-${random_id.suffix.hex}"
  tags   = { Project = "digital-archive" }
}

resource "aws_s3_bucket_cors_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = [var.frontend_origin, "http://localhost:3000"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "photos" {
  bucket                  = aws_s3_bucket.photos.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "photos_public_read" {
  bucket = aws_s3_bucket.photos.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicRead"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.photos.arn}/*"
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.photos]
}

# ── IAM ───────────────────────────────────────────────────
resource "aws_iam_user" "backend" {
  name = "archive-backend-${random_id.suffix.hex}"
  tags = { Project = "digital-archive" }
}

resource "aws_iam_access_key" "backend" {
  user = aws_iam_user.backend.name
}

resource "aws_iam_user_policy" "backend" {
  name = "archive-backend-policy-${random_id.suffix.hex}"
  user = aws_iam_user.backend.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.archive.arn,
          "${aws_dynamodb_table.archive.arn}/index/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
        Resource = "${aws_s3_bucket.photos.arn}/*"
      }
    ]
  })
}
