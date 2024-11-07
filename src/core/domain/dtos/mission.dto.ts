// src/core/domain/dtos/mission.dto.ts
import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsUUID, Min, Max, IsDateString } from 'class-validator';
import { MissionStatus, MissionLocation } from '../interfaces/mission.interface';

export class CreateMissionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus = MissionStatus.DRAFT;

  @IsNumber()
  @Min(0)
  dailyRateMin: number;

  @IsNumber()
  @Min(0)
  dailyRateMax: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsEnum(MissionLocation)
  location: MissionLocation;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsArray()
  @IsUUID("4", { each: true })
  skillIds: string[];
}

export class UpdateMissionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyRateMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyRateMax?: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsEnum(MissionLocation)
  @IsOptional()
  location?: MissionLocation;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  skillIds?: string[];
}