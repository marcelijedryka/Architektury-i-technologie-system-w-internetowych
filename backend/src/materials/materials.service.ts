import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DynamoDBService } from '../common/dynamodb/dynamodb.service';
import { S3Service } from '../common/s3/s3.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ulid } from 'ulid';

export interface Material {
  PK: string; SK: string;
  materialId: string; title: string; description: string;
  imageUrl: string; altText: string; photoDate: string;
  continent?: string; country?: string; city?: string;
  regionId?: string; cityId?: string; streetId?: string;
  uploadedBy: string; uploadedAt: string;
  tags?: string[]; status: 'active' | 'deleted';
  likeCount?: number;
}

@Injectable()
export class MaterialsService {
  constructor(
    private readonly db: DynamoDBService,
    private readonly s3: S3Service,
  ) {}

  async create(dto: CreateMaterialDto, file: Express.Multer.File, uploaderEmail: string): Promise<Material> {
    const id = ulid();
    const imageUrl = await this.s3.upload(file.buffer, file.mimetype);
    const item: Material = {
      PK: `MATERIAL#${id}`, SK: '#META',
      materialId: id, ...dto,
      imageUrl, uploadedBy: uploaderEmail,
      uploadedAt: new Date().toISOString(),
      status: 'active',
    };
    await this.db.put(item);
    return item;
  }

  async findById(id: string): Promise<Material> {
    const result = await this.db.get(`MATERIAL#${id}`, '#META');
    if (!result.Item) throw new NotFoundException('Material not found');
    return result.Item as Material;
  }

  async search(filters: {
    continent?: string; country?: string; city?: string;
    phrase?: string; dateFrom?: string; dateTo?: string;
  }): Promise<Material[]> {
    const result = await this.db.scan({
      FilterExpression: '#st = :active',
      ExpressionAttributeValues: { ':active': 'active' },
      ExpressionAttributeNames: { '#st': 'status' },
    });
    let items = ((result.Items as Material[]) ?? []).filter(i => i.PK.startsWith('MATERIAL#'));

    if (filters.continent) {
      items = items.filter(i => i.continent === filters.continent);
    }
    if (filters.country) {
      const c = filters.country.toLowerCase();
      items = items.filter(i => i.country?.toLowerCase().includes(c));
    }
    if (filters.city) {
      const c = filters.city.toLowerCase();
      items = items.filter(i => i.city?.toLowerCase().includes(c));
    }
    if (filters.phrase) {
      const p = filters.phrase.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(p) ||
        i.description.toLowerCase().includes(p) ||
        i.country?.toLowerCase().includes(p) ||
        i.city?.toLowerCase().includes(p),
      );
    }
    if (filters.dateFrom) items = items.filter(i => i.photoDate >= filters.dateFrom!);
    if (filters.dateTo) items = items.filter(i => i.photoDate <= filters.dateTo!);

    return items;
  }

  async findByUploader(email: string): Promise<Material[]> {
    const result = await this.db.query({
      IndexName: 'ByUploader',
      KeyConditionExpression: 'uploadedBy = :e',
      FilterExpression: '#st = :active',
      ExpressionAttributeValues: { ':e': email, ':active': 'active' },
      ExpressionAttributeNames: { '#st': 'status' },
    });
    return (result.Items as Material[]) ?? [];
  }

  async findAll(): Promise<Material[]> {
    const result = await this.db.scan({
      FilterExpression: 'begins_with(PK, :prefix)',
      ExpressionAttributeValues: { ':prefix': 'MATERIAL#' },
    });
    return (result.Items as Material[]) ?? [];
  }

  async findNewSince(since: string): Promise<Material[]> {
    const result = await this.db.scan({
      FilterExpression: 'begins_with(PK, :prefix) AND uploadedAt > :since',
      ExpressionAttributeValues: { ':prefix': 'MATERIAL#', ':since': since },
    });
    return (result.Items as Material[]) ?? [];
  }

  async update(id: string, dto: UpdateMaterialDto, requesterEmail: string, requesterRole: string): Promise<Material> {
    const material = await this.findById(id);
    if (requesterRole !== 'ADMIN' && material.uploadedBy !== requesterEmail) {
      throw new ForbiddenException('Cannot edit another user\'s material');
    }
    const updates = Object.entries(dto).filter(([, v]) => v !== undefined);
    if (updates.length === 0) return material;
    const expr = 'SET ' + updates.map(([k]) => `#${k} = :${k}`).join(', ');
    const names = Object.fromEntries(updates.map(([k]) => [`#${k}`, k]));
    const values = Object.fromEntries(updates.map(([k, v]) => [`:${k}`, v]));
    const result = await this.db.update(`MATERIAL#${id}`, '#META', expr, values, names);
    return result.Attributes as Material;
  }

  async softDelete(id: string, requesterEmail: string): Promise<void> {
    const material = await this.findById(id);
    if (material.uploadedBy !== requesterEmail) throw new ForbiddenException();
    await this.db.update(`MATERIAL#${id}`, '#META', 'SET #st = :d', { ':d': 'deleted' }, { '#st': 'status' });
  }

  async hardDelete(id: string): Promise<void> {
    const material = await this.findById(id);
    await this.s3.delete(material.imageUrl);
    await this.db.delete(`MATERIAL#${id}`, '#META');
  }

  async toggleLike(materialId: string, email: string): Promise<{ liked: boolean; likeCount: number }> {
    await this.findById(materialId); // throws 404 if not found
    const existing = await this.db.get(`LIKE#${email}`, `MATERIAL#${materialId}`);

    if (existing.Item) {
      await this.db.delete(`LIKE#${email}`, `MATERIAL#${materialId}`);
      const result = await this.db.update(
        `MATERIAL#${materialId}`, '#META',
        'ADD likeCount :dec',
        { ':dec': -1 },
      );
      return { liked: false, likeCount: result.Attributes?.likeCount ?? 0 };
    } else {
      await this.db.put({
        PK: `LIKE#${email}`, SK: `MATERIAL#${materialId}`,
        email, materialId, createdAt: new Date().toISOString(),
      });
      const result = await this.db.update(
        `MATERIAL#${materialId}`, '#META',
        'ADD likeCount :inc',
        { ':inc': 1 },
      );
      return { liked: true, likeCount: result.Attributes?.likeCount ?? 1 };
    }
  }

  async getLikedIds(email: string): Promise<string[]> {
    const result = await this.db.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': `LIKE#${email}`, ':prefix': 'MATERIAL#' },
    });
    return (result.Items ?? []).map((item: any) => item.materialId);
  }
}
