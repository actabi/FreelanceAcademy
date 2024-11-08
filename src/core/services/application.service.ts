// src/core/services/application.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../domain/entities/application.entity';
import { CreateApplicationDto, UpdateApplicationDto } from '../domain/dtos';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const application = this.applicationRepository.create(createApplicationDto);
    return await this.applicationRepository.save(application);
  }

  async findAll() {
    return await this.applicationRepository.find();
  }

  async findByFreelance(freelanceId: string) {
    return await this.applicationRepository.find({
      where: { freelance: { id: freelanceId } }
    });
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    await this.applicationRepository.update(id, updateApplicationDto);
    return await this.applicationRepository.findOne({ where: { id } });
  }
}