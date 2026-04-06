import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../common/dynamodb/dynamodb.service';
import { ulid } from 'ulid';

@Injectable()
export class HierarchyService {
  constructor(private readonly db: DynamoDBService) {}

  async listContinents() {
    const result = await this.db.scan({
      FilterExpression: 'SK = :sk',
      ExpressionAttributeValues: { ':sk': '#META' },
    });
    return (result.Items ?? []).filter((i: any) => i.PK.startsWith('CONTINENT#'));
  }

  async listRegions(continentId: string) {
    const result = await this.db.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': `CONTINENT#${continentId}`, ':prefix': 'REGION#' },
    });
    return result.Items ?? [];
  }

  async listCities(regionId: string) {
    const result = await this.db.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': `REGION#${regionId}`, ':prefix': 'CITY#' },
    });
    return result.Items ?? [];
  }

  async listStreets(cityId: string) {
    const result = await this.db.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': `CITY#${cityId}`, ':prefix': 'STREET#' },
    });
    return result.Items ?? [];
  }

  async createContinent(name: string) {
    const id = ulid().toLowerCase();
    const item = { PK: `CONTINENT#${id}`, SK: '#META', continentId: id, name };
    await this.db.put(item);
    return item;
  }

  async createRegion(continentId: string, name: string) {
    const id = ulid().toLowerCase();
    const item = { PK: `CONTINENT#${continentId}`, SK: `REGION#${id}`, regionId: id, continentId, name };
    await this.db.put(item);
    return item;
  }

  async createCity(regionId: string, name: string) {
    const id = ulid().toLowerCase();
    const item = { PK: `REGION#${regionId}`, SK: `CITY#${id}`, cityId: id, regionId, name };
    await this.db.put(item);
    return item;
  }

  async createStreet(cityId: string, name: string) {
    const id = ulid().toLowerCase();
    const item = { PK: `CITY#${cityId}`, SK: `STREET#${id}`, streetId: id, cityId, name };
    await this.db.put(item);
    return item;
  }
}
