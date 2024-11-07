// src/core/domain/dtos/freelance.dto.ts
import { IsString, IsEmail, IsNumber, IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateFreelanceDto {
  @IsString()
  discordId: string;

  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  skillIds?: string[];
}

export class UpdateFreelanceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  skillIds?: string[];
}