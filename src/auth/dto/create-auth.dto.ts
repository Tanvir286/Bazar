import { Role } from '@prisma/client';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';


export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'add at least 6 characters' })
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role, { message: 'Role must be "user" or "admin"' })
  @IsOptional()
  role?: Role; // Optional, defaults to 'user'
}