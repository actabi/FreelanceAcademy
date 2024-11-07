// src/core/services/matching.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionEntity } from '../domain/entities/mission.entity';
import { FreelanceEntity } from '../domain/entities/freelance.entity';
import { IMission } from '../domain/interfaces/mission.interface';
import { IFreelance } from '../domain/interfaces/freelance.interface';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(MissionEntity)
    private missionRepository: Repository<MissionEntity>,
    @InjectRepository(FreelanceEntity)
    private freelanceRepository: Repository<FreelanceEntity>
  ) {}

  async findMatchingFreelances(missionId: string): Promise<IFreelance[]> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['skills']
    });

    if (!mission) return [];

    const skillIds = mission.skills.map(skill => skill.id);

    return this.freelanceRepository
      .createQueryBuilder('freelance')
      .innerJoinAndSelect('freelance.skills', 'skill')
      .where('freelance.isActive = :isActive', { isActive: true })
      .andWhere('freelance.dailyRate BETWEEN :minRate AND :maxRate', {
        minRate: mission.dailyRateMin,
        maxRate: mission.dailyRateMax,
      })
      .andWhere('skill.id IN (:...skillIds)', { skillIds })
      .getMany();
  }

  async findMatchingMissions(freelanceId: string): Promise<IMission[]> {
    const freelance = await this.freelanceRepository.findOne({
      where: { id: freelanceId },
      relations: ['skills']
    });

    if (!freelance) return [];

    const skillIds = freelance.skills.map(skill => skill.id);

    return this.missionRepository
      .createQueryBuilder('mission')
      .innerJoinAndSelect('mission.skills', 'skill')
      .where('mission.status = :status', { status: 'PUBLISHED' })
      .andWhere('skill.id IN (:...skillIds)', { skillIds })
      .andWhere('mission.dailyRateMin <= :rate', { rate: freelance.dailyRate })
      .andWhere('mission.dailyRateMax >= :rate', { rate: freelance.dailyRate })
      .getMany();
  }
}
