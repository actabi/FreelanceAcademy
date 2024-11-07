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
  import { MissionService } from '../../core/services/mission.service';
  import { CreateMissionDto, UpdateMissionDto } from '../../core/domain/dtos';
  import { AuthGuard } from '../guards/auth.guard';
  import { RateLimit } from '../decorators/rate-limit.decorator';
  
  @Controller('api/missions')
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
    @RateLimit(1000, 60)
    async getMissions(
      @Query('status') status?: string,
      @Query('skills') skills?: string,
      @Query('minRate') minRate?: number,
      @Query('maxRate') maxRate?: number,
      @Query('location') location?: string,
    ) {
      try {
        return await this.missionService.findAll({
          status,
          skills: skills?.split(','),
          minRate,
          maxRate,
          location
        });
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
  
  // src/api/controllers/freelance.controller.ts
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
  import { FreelanceService } from '../../core/services/freelance.service';
  import { CreateFreelanceDto, UpdateFreelanceDto } from '../../core/domain/dtos';
  import { AuthGuard } from '../guards/auth.guard';
  import { RateLimit } from '../decorators/rate-limit.decorator';
  
  @Controller('api/freelances')
  @UseGuards(AuthGuard)
  export class FreelanceController {
    constructor(private readonly freelanceService: FreelanceService) {}
  
    @Post()
    @RateLimit(100, 60)
    async createProfile(@Body(ValidationPipe) createFreelanceDto: CreateFreelanceDto) {
      try {
        return await this.freelanceService.create(createFreelanceDto);
      } catch (error) {
        throw new HttpException(
          'Failed to create profile',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Get(':id')
    @RateLimit(1000, 60)
    async getProfile(@Param('id') id: string) {
      const profile = await this.freelanceService.findOne(id);
      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }
      return profile;
    }
  
    @Put(':id')
    @RateLimit(100, 60)
    async updateProfile(
      @Param('id') id: string,
      @Body(ValidationPipe) updateFreelanceDto: UpdateFreelanceDto
    ) {
      try {
        return await this.freelanceService.update(id, updateFreelanceDto);
      } catch (error) {
        throw new HttpException(
          'Failed to update profile',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }