import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { MissionStatus, MissionLocation } from '../enums/mission.enums';

export class MissionFilterDto {
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsNumber()
  minRate?: number;

  @IsOptional()
  @IsNumber()
  maxRate?: number;

  @IsOptional()
  @IsEnum(MissionLocation)
  location?: MissionLocation;
}