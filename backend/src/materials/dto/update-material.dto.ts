import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateMaterialDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsString() photoDate?: string;
  @IsOptional() @IsString() continent?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() regionId?: string;
  @IsOptional() @IsString() cityId?: string;
  @IsOptional() @IsString() streetId?: string;
  @IsOptional() @IsArray() tags?: string[];
}
