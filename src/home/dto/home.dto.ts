import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { propertyType } from '@prisma/client';

export class HomeResponseDto {
  id: number;
  @Exclude()
  adress: string;
  @Expose({ name: 'Adresa' })
  Adresa() {
    return this.adress;
  }
  @Exclude()
  bedrooms: number;
  @Expose({ name: 'NrDeDormitoare' })
  NrDeDormitoare() {
    return this.bedrooms;
  }
  @Exclude()
  bathroams: number;
  @Expose({ name: 'NrDeBai' })
  NrDeBai() {
    return this.bathroams;
  }
  @Exclude()
  city: string;
  @Expose({ name: 'Locatia' })
  Loocatia() {
    return this.city;
  }
  @Exclude()
  listed_date: Date;
  @Exclude()
  price: number;
  @Expose({ name: 'Pretul' })
  Pretul() {
    return this.price;
  }
  @Exclude()
  size: number;
  @Expose({ name: 'Suprafata' })
  Suprafata() {
    return this.size;
  }
  @Exclude()
  type: propertyType;
  @Expose({ name: 'Tipul' })
  Tipul() {
    return this.type;
  }
  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  realtorId: number;
  image: string;
  @Exclude()
  images?: {}[];
  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

export class HomeFilterDto {
  @IsOptional()
  @IsString()
  city?: string;
  @IsOptional()
  price?: {
    gte?: number;
    lte?: number;
  };
  @IsOptional()
  @IsEnum(propertyType)
  type?: propertyType;
}

class Image {
  @IsNotEmpty()
  @IsString()
  url: string;
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  adress: string;
  @IsNumber()
  @IsNotEmpty()
  price: number;
  @IsNumber()
  @IsNotEmpty()
  bedrooms: number;
  @IsNumber()
  @IsNotEmpty()
  bathroams: number;
  @IsString()
  @IsNotEmpty()
  city: string;
  @IsNumber()
  @IsNotEmpty()
  size: number;
  @IsEnum(propertyType)
  @IsNotEmpty()
  type: propertyType;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
}
export class ModifyHomeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adress?: string;
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  price?: number;
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  bedrooms?: number;
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  bathroams?: number;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  size?: number;
  @IsOptional()
  @IsEnum(propertyType)
  @IsNotEmpty()
  type?: propertyType;
}

export class InquireDto{
  @IsString()
  @IsNotEmpty()
  message:string;
}