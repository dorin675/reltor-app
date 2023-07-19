import { UserType } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class SingupDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: 'Phone must be a valid one',
  })
  phone: string;
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey?: string;
}

export class SinginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class GenerateProductKeyDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}

export class tokenData{
  @IsString()
  @IsNotEmpty()
  name?: string;
  @IsNumber()
  @IsNotEmpty()
  id?: number;
  @IsNumber()
  @IsNotEmpty()
  iat?: number;
  @IsNumber()
  @IsNotEmpty()
  exp?: number;
}
