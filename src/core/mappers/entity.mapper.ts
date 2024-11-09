// src/core/mappers/entity.mapper.ts
import { MissionEntity } from '../domain/entities/mission.entity';
import { FreelanceEntity } from '../domain/entities/freelance.entity';
import { SkillEntity } from '../domain/entities/skill.entity';
import { ApplicationEntity } from '../domain/entities/application.entity';
import { IMission } from '../domain/interfaces/mission.interface';
import { IFreelance } from '../domain/interfaces/freelance.interface';
import { ISkill } from '../domain/interfaces/skill.interface';
import { IApplication } from '../domain/interfaces/application.interface';

export class EntityMapper {
  static toSkill(entity: SkillEntity, includeRelations = true): ISkill | null {
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      category: entity.category,
      missions: includeRelations && entity.missions 
        ? entity.missions.map(m => this.toMission(m, false)).filter((m): m is IMission => m !== null)
        : [],
      freelances: includeRelations && entity.freelances
        ? entity.freelances.map(f => this.toFreelance(f, false)).filter((f): f is IFreelance => f !== null)
        : []
    };
  }

  static toMission(entity: MissionEntity, includeRelations = true): IMission | null {
    if (!entity) return null;

    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      dailyRateMin: entity.dailyRateMin,
      dailyRateMax: entity.dailyRateMax,
      startDate: entity.startDate,
      endDate: entity.endDate,
      location: entity.location,
      companyName: entity.companyName,
      address: entity.address,
      discordMessageId: entity.discordMessageId,
      skills: includeRelations && entity.skills
        ? entity.skills.map(s => this.toSkill(s, false)).filter((s): s is ISkill => s !== null)
        : [],
      applications: includeRelations && entity.applications
        ? entity.applications.map(a => this.toApplication(a, false)).filter((a): a is IApplication => a !== null)
        : [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  static toFreelance(entity: FreelanceEntity, includeRelations = true): IFreelance | null {
    if (!entity) return null;

    return {
      id: entity.id,
      discordId: entity.discordId,
      name: entity.name,
      email: entity.email,
      dailyRate: entity.dailyRate,
      isActive: entity.isActive,
      isAvailable: entity.isAvailable,
      skills: includeRelations && entity.skills
        ? entity.skills.map(s => this.toSkill(s, false)).filter((s): s is ISkill => s !== null)
        : [],
      applications: includeRelations && entity.applications
        ? entity.applications.map(a => this.toApplication(a, false)).filter((a): a is IApplication => a !== null)
        : [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  static toApplication(entity: ApplicationEntity, includeRelations = true): IApplication | null {
    if (!entity) return null;

    return {
      id: entity.id,
      status: entity.status,
      message: entity.message,
      expectedDailyRate: entity.expectedDailyRate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      mission: includeRelations && entity.mission 
      ? this.toMission(entity.mission, false) || undefined 
      : undefined,
    freelance: includeRelations && entity.freelance 
      ? this.toFreelance(entity.freelance, false) || undefined 
      : undefined
    };
  }
}

// Helper function
function throwError(message: string): never {
    throw new Error(message);
  }