// src/core/domain/dtos/application.dto.ts
import { IsUUID, IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';

export class CreateApplicationDto {
  @IsUUID("4")
  missionId: string;

  @IsUUID("4")
  freelanceId: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  @IsOptional()
  expectedDailyRate?: number;
}

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  @IsOptional()
  expectedDailyRate?: number;
}