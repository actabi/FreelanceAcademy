// src/core/services/mission.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionEntity } from '../domain/entities/mission.entity';
import { SkillEntity } from '../domain/entities/skill.entity';
import { CreateMissionDto, UpdateMissionDto } from '../domain/dtos';
import { IMission, MissionStatus } from '../domain/interfaces/mission.interface';
import { NotificationService } from './notification.service';
import { CacheService } from './cache.service';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(MissionEntity)
    private missionRepository: Repository<MissionEntity>,
    @InjectRepository(SkillEntity)
    private skillRepository: Repository<SkillEntity>,
    private notificationService: NotificationService,
    private cacheService: CacheService
  ) {}

  async create(createMissionDto: CreateMissionDto): Promise<IMission> {
    const mission = this.missionRepository.create(createMissionDto);

    if (createMissionDto.skillIds?.length) {
      mission.skills = await this.skillRepository.findByIds(createMissionDto.skillIds);
    }

    const savedMission = await this.missionRepository.save(mission);
    await this.cacheService.setMission(savedMission);

    return savedMission;
  }

  async publish(id: string): Promise<IMission> {
    const mission = await this.findOne(id);
    if (!mission) {
      throw new NotFoundException(`Mission with ID "${id}" not found`);
    }

    mission.status = MissionStatus.PUBLISHED;
    const publishedMission = await this.missionRepository.save(mission); //ajouter l'id
    
    // Publier sur Discord
    await this.notificationService.notifyNewMission(publishedMission);
    
    // Mettre à jour le cache
    await this.cacheService.setMission(publishedMission);

    return publishedMission;
  }

  async findAll(): Promise<IMission[]> {
    return this.missionRepository.find({
      relations: ['skills', 'applications'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findOne(id: string): Promise<IMission | null> {
    // Vérifier d'abord dans le cache
    const cachedMission = await this.cacheService.getMission(id);
    if (cachedMission) return cachedMission;

    // Si non trouvé dans le cache, chercher dans la base de données
    const mission = await this.missionRepository.findOne({
      where: { id },
      relations: ['skills', 'applications']
    });

    if (mission) {
      await this.cacheService.setMission(mission); //ajouter l'id
    }

    return mission;
  }

  async update(id: string, updateMissionDto: UpdateMissionDto): Promise<IMission> {
    const mission = await this.findOne(id);
    if (!mission) {
      throw new NotFoundException(`Mission with ID "${id}" not found`);
    }

    if (updateMissionDto.skillIds) {
      mission.skills = await this.skillRepository.findByIds(updateMissionDto.skillIds);
    }

    Object.assign(mission, updateMissionDto);
    const updatedMission = await this.missionRepository.save(mission);
    
    // Invalider le cache
    await this.cacheService.invalidateMission(id);

    return updatedMission;
  }
}