// src/api/controllers/mission.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    Query,
    ValidationPipe,
    HttpStatus,
    HttpException
  } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
  import { MissionService } from '../../core/services/mission.service';
  import { CreateMissionDto, UpdateMissionDto } from '../../core/domain/dtos';
  import { MissionFilterDto } from 'src/core/domain/dtos/mission-filter.dto';
  import { AuthGuard } from '../guards/auth.guard';
  import { RateLimit } from '../decorators/rate-limit.decorator';
  import { MissionStatus, MissionLocation } from 'src/core/domain/enums/mission.enums';
  
  @Controller('api/missions')
  @ApiTags('missions')
  @UseGuards(AuthGuard)
  export class MissionController {
    constructor(private readonly missionService: MissionService) {}
  
    @Post()
    @RateLimit(100, 60) // 100 requests per 60 seconds
    async createMission(@Body(ValidationPipe) createMissionDto: CreateMissionDto) {
      try {
        return await this.missionService.create(createMissionDto);
      } catch (error) {
        throw new HttpException(
          'Failed to create mission',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all missions with optional filters' })
    @RateLimit(1000, 60)
    async getMissions(
      @Query('status') status?: string,
      @Query('skills') skills?: string,
      @Query('minRate') minRate?: number,
      @Query('maxRate') maxRate?: number,
      @Query('location') location?: string,
    ) {
      try {
        // Vérifier si des filtres sont fournis
        const hasFilters = status || skills || minRate || maxRate || location;
        
        if (!hasFilters) {
          // Si aucun filtre n'est fourni, utiliser la méthode simple
          return await this.missionService.findAll();
        }
  
        // Si des filtres sont fournis, les appliquer
        const filters: MissionFilterDto = {
          status: status as MissionStatus,
          skills: skills?.split(',').map(s => s.trim()),
          minRate: minRate ? Number(minRate) : undefined,
          maxRate: maxRate ? Number(maxRate) : undefined,
          location: location as MissionLocation
        };
  
        return await this.missionService.findAll(filters);
      } catch (error) {
        throw new HttpException(
          'Failed to fetch missions',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Get(':id')
    @RateLimit(1000, 60)
    async getMission(@Param('id') id: string) {
      const mission = await this.missionService.findOne(id);
      if (!mission) {
        throw new HttpException('Mission not found', HttpStatus.NOT_FOUND);
      }
      return mission;
    }
  
    @Put(':id')
    @RateLimit(100, 60)
    async updateMission(
      @Param('id') id: string,
      @Body(ValidationPipe) updateMissionDto: UpdateMissionDto
    ) {
      try {
        return await this.missionService.update(id, updateMissionDto);
      } catch (error) {
        throw new HttpException(
          'Failed to update mission',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }