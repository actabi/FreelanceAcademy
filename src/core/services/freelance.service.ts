// src/core/services/freelance.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelanceEntity } from '../domain/entities/freelance.entity';
import { CreateFreelanceDto, UpdateFreelanceDto } from '../domain/dtos/freelance.dto';
import { IFreelance } from '../domain/interfaces/freelance.interface';
import { CacheService } from './cache.service';

@Injectable()
export class FreelanceService {
  constructor(
    @InjectRepository(FreelanceEntity)
    private freelanceRepository: Repository<FreelanceEntity>,
    private cacheService: CacheService
  ) {}

  async create(createFreelanceDto: CreateFreelanceDto): Promise<IFreelance> {
    const freelance = this.freelanceRepository.create(createFreelanceDto);
    const savedFreelance = await this.freelanceRepository.save(freelance);
    await this.cacheService.setFreelance(savedFreelance.id, savedFreelance);
    return savedFreelance;
  }

  async findById(id: string): Promise<IFreelance | null> {
    const cached = await this.cacheService.getFreelance(id);
    if (cached) return cached;

    const freelance = await this.freelanceRepository.findOne({
      where: { id },
      relations: ['skills', 'applications']
    });

    if (freelance) {
      await this.cacheService.setFreelance(id, freelance);
    }

    return freelance;
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
    const freelance = await this.findById(id);
    if (!freelance) {
      throw new NotFoundException(`Freelance with ID "${id}" not found`);
    }

    Object.assign(freelance, updateFreelanceDto);
    const updatedFreelance = await this.freelanceRepository.save(freelance);
    
    await this.cacheService.invalidateFreelance(id, freelance.discordId);
    return updatedFreelance;
  }
}