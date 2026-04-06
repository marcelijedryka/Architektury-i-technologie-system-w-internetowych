import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from '../common/dynamodb/dynamodb.service';
import { CreateUserDto } from './dto/create-user.dto';

export type UserRole = 'VIEWER' | 'CREATOR' | 'ADMIN';

export interface User {
  PK: string;
  SK: string;
  email: string;
  name: string;
  role: UserRole;
  isBlocked: boolean;
  authProvider: 'local' | 'google';
  passwordHash?: string;
  createdAt: string;
  lastLoginAt?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DynamoDBService) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.get(`USER#${email}`, '#PROFILE');
    return (result.Item as User) ?? null;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('User already exists');

    const user: User = {
      PK: `USER#${dto.email}`,
      SK: '#PROFILE',
      email: dto.email,
      name: dto.name,
      role: 'CREATOR',
      isBlocked: false,
      authProvider: dto.authProvider,
      passwordHash: dto.passwordHash,
      createdAt: new Date().toISOString(),
    };
    await this.db.put(user);
    return user;
  }

  async findOrCreateGoogleUser(email: string, name: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      await this.updateLastLogin(email);
      return existing;
    }
    return this.create({ email, name, authProvider: 'google' });
  }

  async updateLastLogin(email: string): Promise<void> {
    await this.db.update(
      `USER#${email}`, '#PROFILE',
      'SET lastLoginAt = :t',
      { ':t': new Date().toISOString() },
    );
  }

  async blockUser(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    await this.db.update(`USER#${email}`, '#PROFILE', 'SET isBlocked = :b', { ':b': true });
  }

  async unblockUser(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    await this.db.update(`USER#${email}`, '#PROFILE', 'SET isBlocked = :b', { ':b': false });
  }

  async listAll(): Promise<User[]> {
    const result = await this.db.scan({
      FilterExpression: 'SK = :sk',
      ExpressionAttributeValues: { ':sk': '#PROFILE' },
    });
    return (result.Items as User[]) ?? [];
  }
}
