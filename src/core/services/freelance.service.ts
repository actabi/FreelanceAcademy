// src/core/services/freelance.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelanceEntity } from '../domain/entities/freelance.entity';
import { CreateFreelanceDto, UpdateFreelanceDto } from '../domain/dtos/freelance.dto';
import { IFreelance } from '../domain/interfaces/freelance.interface';
import { CacheService } from './cache.service';
import { EntityMapper } from '../mappers/entity.mapper';

@Injectable()
export class FreelanceService {
  constructor(
    @InjectRepository(FreelanceEntity)
    private freelanceRepository: Repository<FreelanceEntity>,
    private cacheService: CacheService
  ) {}

  private convertToInterface(entity: FreelanceEntity): IFreelance {
    return {
      ...entity,
      skills: entity.skills?.map(skill => ({
        ...skill,
        missions: skill.missions?.map(mission => ({
          ...mission,
          status: mission.status 
        }))
      }))
    };
  }

  async create(createFreelanceDto: CreateFreelanceDto): Promise<IFreelance> {
    const freelance = this.freelanceRepository.create(createFreelanceDto);
    const savedFreelance = await this.freelanceRepository.save(freelance);
    const freelanceInterface = EntityMapper.toFreelance(savedFreelance);
    
    if (!freelanceInterface) {
      throw new Error(`Failed to map freelance entity to interface: ${savedFreelance.id}`);
    }
  
    await this.cacheService.setFreelance(savedFreelance.id, freelanceInterface);
    return freelanceInterface;
}

  async findById(id: string): Promise<IFreelance | null> {
    // First check cache
    const cached = await this.cacheService.getFreelance(id);
    if (cached) return cached;
  
    // If not in cache, fetch from database
    const freelance = await this.freelanceRepository.findOne({
      where: { id },
      relations: ['skills', 'skills.missions', 'applications']
    });
  
    if (!freelance) return null;
  
    // Convert entity to interface
    const freelanceInterface = EntityMapper.toFreelance(freelance);
    
    // Only cache if we have a valid interface object
    if (freelanceInterface) {
      await this.cacheService.setFreelance(id, freelanceInterface);
      return freelanceInterface;
    }
  
    return null;
  }

  // Add type guard for better type safety
private isValidFreelance(value: any): value is IFreelance {
  return value && 
         typeof value.id === 'string' &&
         typeof value.discordId === 'string';
}

  async findByDiscordId(discordId: string): Promise<IFreelance | null> {
    // Check cache first
    const cached = await this.cacheService.getFreelanceByDiscordId(discordId);
    if (cached) return cached;
  
    // Fetch from database if not in cache
    const freelance = await this.freelanceRepository.findOne({
      where: { discordId },
      relations: ['skills', 'skills.missions', 'applications']
    });
  
    if (!freelance) return null;
  
    // Convert entity to interface and handle potential null
    const freelanceInterface = EntityMapper.toFreelance(freelance);
    if (!freelanceInterface) {
      return null;
    }
  
    // Cache the valid interface
    await this.cacheService.setFreelance(freelance.id, freelanceInterface);
    return freelanceInterface;
  }

  async update(id: string, updateFreelanceDto: UpdateFreelanceDto): Promise<IFreelance | null> {
    const freelance = await this.freelanceRepository.findOne({
      where: { id },
      relations: ['skills', 'skills.missions', 'applications']
    });

    if (!freelance) {
      throw new NotFoundException(`Freelance with ID "${id}" not found`);
    }

    Object.assign(freelance, updateFreelanceDto);
    const updatedFreelance = await this.freelanceRepository.save(freelance);
    
    const freelanceInterface = EntityMapper.toFreelance(updatedFreelance);
    if (!freelanceInterface) {
      return null;
    }
    
    await this.cacheService.invalidateFreelance(id, freelance.discordId);
    return freelanceInterface;
  }
}