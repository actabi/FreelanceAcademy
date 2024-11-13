// src/startup.check.ts
import { Logger } from '@nestjs/common';

export function checkRequiredEnvVars() {
  const logger = new Logger('StartupCheck');
  const requiredVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID',
    'DISCORD_CHANNEL_ID'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const message = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }

  // Log successful configuration
  logger.log('All required environment variables are present');
  
  // Log configuration without exposer les valeurs sensibles
  logger.debug('Configuration loaded:', {
    database: process.env.DATABASE_URL ? '✓ Connected' : '✗ Missing',
    redis: process.env.REDIS_URL ? '✓ Connected' : '✗ Missing',
    discord: {
      token: process.env.DISCORD_TOKEN ? '✓ Present' : '✗ Missing',
      clientId: process.env.DISCORD_CLIENT_ID ? '✓ Present' : '✗ Missing',
      channelId: process.env.DISCORD_CHANNEL_ID ? '✓ Present' : '✗ Missing'
    }
  });
}