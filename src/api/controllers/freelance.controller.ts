// src/api/controllers/freelance.controller.ts
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
  NotFoundException
} from '@nestjs/common';
import { FreelanceService } from '../../core/services/freelance.service';
import { AuthGuard } from '../guards/auth.guard';
import { RateLimit } from '../decorators/rate-limit.decorator';
import { CreateFreelanceDto, UpdateFreelanceDto } from '../../core/domain/dtos/freelance.dto';

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
    const profile = await this.freelanceService.findById(id); // Changed from findOne to findById
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
      if (error instanceof NotFoundException) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
