output "dynamodb_table_name" {
  value = aws_dynamodb_table.archive.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.photos.bucket
}

output "iam_access_key_id" {
  value     = aws_iam_access_key.backend.id
  sensitive = true
}

output "iam_secret_access_key" {
  value     = aws_iam_access_key.backend.secret
  sensitive = true
}
