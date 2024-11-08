// src/api/controllers/application.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    ValidationPipe,
    HttpStatus,
    HttpException,
    Query
  } from '@nestjs/common';

  import { ApplicationService } from '../../core/services/application.service';
  import { CreateApplicationDto, UpdateApplicationDto } from '../../core/domain/dtos';
  import { AuthGuard } from '../guards/auth.guard';
  import { RateLimit } from '../decorators/rate-limit.decorator';
  
  @Controller('api/applications')
  @UseGuards(AuthGuard)
  export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) {}
  
    @Post()
    @RateLimit(100, 60)
    async apply(@Body(ValidationPipe) createApplicationDto: CreateApplicationDto) {
      try {
        return await this.applicationService.create(createApplicationDto);
      } catch (error) {
        throw new HttpException(
          'Failed to submit application',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Get()
    @RateLimit(1000, 60)
    async getApplications(@Query('freelanceId') freelanceId?: string) {
      try {
        if (freelanceId) {
          return await this.applicationService.findByFreelance(freelanceId);
        }
        return await this.applicationService.findAll();
      } catch (error) {
        throw new HttpException(
          'Failed to fetch applications',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Put(':id')
    @RateLimit(100, 60)
    async updateApplication(
      @Param('id') id: string,
      @Body(ValidationPipe) updateApplicationDto: UpdateApplicationDto
    ) {
      try {
        return await this.applicationService.update(id, updateApplicationDto);
      } catch (error) {
        throw new HttpException(
          'Failed to update application',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }