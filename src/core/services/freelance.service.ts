// src/core/services/freelance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelanceEntity } from '../domain/entities/freelance.entity';
import { SkillEntity } from '../domain/entities/skill.entity';
import { CreateFreelanceDto, UpdateFreelanceDto } from '../domain/dtos';
import { IFreelance } from '../domain/interfaces/freelance.interface';
import { CacheService } from './cache.service';

@Injectable()
export class FreelanceService {
  constructor(
    @InjectRepository(FreelanceEntity)
    private freelanceRepository: Repository<FreelanceEntity>,
    @InjectRepository(SkillEntity)
    private skillRepository: Repository<SkillEntity>,
    private cacheService: CacheService
  ) {}

  async create(createFreelanceDto: CreateFreelanceDto): Promise<IFreelance> {
    const freelance = this.freelanceRepository.create(createFreelanceDto);

    if (createFreelanceDto.skillIds?.length) {
      freelance.skills = await this.skillRepository.findByIds(createFreelanceDto.skillIds);
    }

    const savedFreelance = await this.freelanceRepository.save(freelance);
    await this.cacheService.setFreelance(savedFreelance.id, savedFreelance);

    return savedFreelance;
  }

  async findByDiscordId(discordId: string): Promise<IFreelance | null> {
    const cached = await this.cacheService.getFreelanceByDiscordId(discordId);
    if (cached) return cached;

    const freelance = await this.freelanceRepository.findOne({
      where: { discordId },
      relations: ['skills', 'applications']
    });

    if (freelance) {
      await this.cacheService.setFreelance(freelance.id, freelance);
    }

    return freelance;
  }

  async update(id: string, updateFreelanceDto: UpdateFreelanceDto): Promise<IFreelance> {
    const freelance = await this.freelanceRepository.findOne({
      where: { id },
      relations: ['skills']
    });

    if (!freelance) {
      throw new NotFoundException(`Freelance with ID "${id}" not found`);
    }

    if (updateFreelanceDto.skillIds) {
      freelance.skills = await this.skillRepository.findByIds(updateFreelanceDto.skillIds);
    }

    Object.assign(freelance, updateFreelanceDto);
    const updatedFreelance = await this.freelanceRepository.save(freelance);
    
    await this.cacheService.invalidateFreelance(id);
    return updatedFreelance;
  }
}