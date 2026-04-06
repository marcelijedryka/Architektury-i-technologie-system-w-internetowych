import { Module, Global } from '@nestjs/common';
import { DynamoDBService } from './dynamodb/dynamodb.service';
import { S3Service } from './s3/s3.service';

@Global()
@Module({
  providers: [DynamoDBService, S3Service],
  exports: [DynamoDBService, S3Service],
})
export class CommonModule {}
