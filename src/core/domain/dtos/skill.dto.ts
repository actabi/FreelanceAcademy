// src/core/domain/dtos/skill.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export class UpdateSkillDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;
}