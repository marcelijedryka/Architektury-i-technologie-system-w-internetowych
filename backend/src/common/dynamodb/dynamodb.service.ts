import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const raw = new DynamoDBClient({
      region: process.env.AWS_REGION || 'eu-central-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.client = DynamoDBDocumentClient.from(raw);
    this.tableName = process.env.DYNAMODB_TABLE_NAME || 'archive-table';
  }

  get(PK: string, SK: string) {
    return this.client.send(new GetCommand({ TableName: this.tableName, Key: { PK, SK } }));
  }

  put(item: Record<string, any>) {
    return this.client.send(new PutCommand({ TableName: this.tableName, Item: item }));
  }

  update(PK: string, SK: string, expression: string, values: Record<string, any>, names?: Record<string, string>) {
    return this.client.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { PK, SK },
      UpdateExpression: expression,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: names,
      ReturnValues: 'ALL_NEW',
    }));
  }

  delete(PK: string, SK: string) {
    return this.client.send(new DeleteCommand({ TableName: this.tableName, Key: { PK, SK } }));
  }

  query(params: Omit<ConstructorParameters<typeof QueryCommand>[0], 'TableName'>) {
    return this.client.send(new QueryCommand({ TableName: this.tableName, ...params }));
  }

  scan(params?: Omit<ConstructorParameters<typeof ScanCommand>[0], 'TableName'>) {
    return this.client.send(new ScanCommand({ TableName: this.tableName, ...params }));
  }
}
