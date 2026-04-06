import { IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMaterialDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsString() altText: string;
  @IsString() photoDate: string;
  @IsOptional() @IsString() continent?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() regionId?: string;
  @IsOptional() @IsString() cityId?: string;
  @IsOptional() @IsString() streetId?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return []; }
    }
    return value;
  })
  tags?: string[];
}
