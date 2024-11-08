// src/core/services/mission.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MissionEntity } from '../domain/entities/mission.entity';
import { SkillEntity } from '../domain/entities/skill.entity';
import { CreateMissionDto, UpdateMissionDto } from '../domain/dtos';
import { IMission, MissionStatus } from '../domain/interfaces/mission.interface';
import { NotificationService } from './notification.service';
import { CacheService } from './cache.service';
import { MissionFilterDto } from '../domain/dtos/mission-filter.dto';

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

  // async findAll(): Promise<IMission[]> {
  //   return this.missionRepository.find({
  //     relations: ['skills', 'applications'],
  //     order: {
  //       createdAt: 'DESC'
  //     }
  //   });
  // }

  // async findAll(filters?: MissionFilterDto): Promise<MissionEntity[]> {
  //   const query = this.missionRepository.createQueryBuilder('mission')
  //     .leftJoinAndSelect('mission.skills', 'skills')
  //     .leftJoinAndSelect('mission.applications', 'applications');

  //   if (filters) {
  //     if (filters.status) {
  //       query.andWhere('mission.status = :status', { status: filters.status });
  //     }

  //     if (filters.skills?.length) {
  //       query.andWhere('skills.name IN (:...skills)', { skills: filters.skills });
  //     }

  //     if (filters.minRate) {
  //       query.andWhere('mission.dailyRateMin >= :minRate', { minRate: filters.minRate });
  //     }

  //     if (filters.maxRate) {
  //       query.andWhere('mission.dailyRateMax <= :maxRate', { maxRate: filters.maxRate });
  //     }

  //     if (filters.location) {
  //       query.andWhere('mission.location = :location', { location: filters.location });
  //     }
  //   }

  //   query.orderBy('mission.createdAt', 'DESC');

  //   return query.getMany();
  // }

  // Maintenir la méthode existante
  async findAll(): Promise<IMission[]>;
  async findAll(filters: MissionFilterDto): Promise<IMission[]>;
  async findAll(filters?: MissionFilterDto): Promise<IMission[]> {
    // Si aucun filtre n'est fourni, utiliser le comportement original
    if (!filters) {
      return this.missionRepository.find({
        relations: ['skills', 'applications'],
        order: {
          createdAt: 'DESC'
        }
      });
    }

    // Sinon, utiliser la logique de filtrage
    const query = this.missionRepository.createQueryBuilder('mission')
      .leftJoinAndSelect('mission.skills', 'skills')
      .leftJoinAndSelect('mission.applications', 'applications');

    if (filters.status) {
      query.andWhere('mission.status = :status', { status: filters.status });
    }

    if (filters.skills?.length) {
      query.andWhere('skills.name IN (:...skills)', { skills: filters.skills });
    }

    if (filters.minRate) {
      query.andWhere('mission.dailyRateMin >= :minRate', { minRate: filters.minRate });
    }

    if (filters.maxRate) {
      query.andWhere('mission.dailyRateMax <= :maxRate', { maxRate: filters.maxRate });
    }

    if (filters.location) {
      query.andWhere('mission.location = :location', { location: filters.location });
    }

    query.orderBy('mission.createdAt', 'DESC');

    return query.getMany();
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
    // 1. Récupérer la mission existante avec ses relations
    const existingMission = await this.missionRepository.findOne({
      where: { id },
      relations: ['skills', 'applications']
    });

    if (!existingMission) {
      throw new NotFoundException(`Mission with ID "${id}" not found`);
    }

    // 2. Sauvegarder l'ancien statut pour vérifier les changements
    const oldStatus = existingMission.status;
    const wasPublished = oldStatus === MissionStatus.PUBLISHED;

    // 3. Gérer la mise à jour des compétences si nécessaire
    if (updateMissionDto.skillIds?.length) {
      const skills = await this.skillRepository.findBy({
        id: In(updateMissionDto.skillIds)
      });
      
      if (skills.length !== updateMissionDto.skillIds.length) {
        throw new Error('Some skill IDs are invalid');
      }
      
      existingMission.skills = skills;
    }

    // 4. Mettre à jour les champs de la mission
    Object.assign(existingMission, {
      ...updateMissionDto,
      updatedAt: new Date()
    });

    // 5. Sauvegarder les modifications
    const updatedMission = await this.missionRepository.save(existingMission);

    // 6. Gérer les notifications Discord si nécessaire
    const isNowPublished = updatedMission.status === MissionStatus.PUBLISHED;
    
    if (!wasPublished && isNowPublished) {
      // Nouvelle publication
      await this.notificationService.notifyNewMission(updatedMission);
    } else if (wasPublished && isNowPublished && existingMission.discordMessageId) {
      // Mise à jour d'une mission déjà publiée
      try {
        await this.notificationService.updatePublishedMission(updatedMission);
      } catch (error) {
        console.error('Failed to update Discord message:', error);
        // Ne pas bloquer la mise à jour si la notification échoue
      }
    }

    // 7. Invalider le cache
    await this.cacheService.invalidateMission(id);

    return updatedMission;
  }
}