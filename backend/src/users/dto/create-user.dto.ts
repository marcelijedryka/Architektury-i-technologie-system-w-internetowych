import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() name: string;
  @IsOptional() @IsString() passwordHash?: string;
  @IsIn(['local', 'google']) authProvider: 'local' | 'google';
}
