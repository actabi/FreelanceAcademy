// config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development'
};

// config/redis.config.ts
export const redisConfig = {
  url: process.env.REDIS_URL
};

// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*'
  });
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { HealthController } from './api/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot(databaseConfig)
  ],
  controllers: [HealthController],
})
export class AppModule {}