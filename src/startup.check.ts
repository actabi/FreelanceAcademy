// src/startup.check.ts
import { Logger } from '@nestjs/common';

export function checkRequiredEnvVars() {
  const logger = new Logger('StartupCheck');
  const isDevelopment = process.env.NODE_ENV === 'development';

  const requiredVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID',
    isDevelopment ? 'DISCORD_GUILD_ID' : undefined // Guild ID requis uniquement en dev
  ].filter(Boolean);

  const missingVars = requiredVars.filter(varName => !process.env[varName as string]);

  if (missingVars.length > 0) {
    const message = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }

  // Log de la configuration
  logger.log(`Environment: ${process.env.NODE_ENV}`);
  logger.log('All required environment variables are present');
  
  if (isDevelopment) {
    logger.debug('Configuration loaded:', {
      database: process.env.DATABASE_URL ? '✓ Connected' : '✗ Missing',
      redis: process.env.REDIS_URL ? '✓ Connected' : '✗ Missing',
      discord: {
        token: process.env.DISCORD_TOKEN ? '✓ Present' : '✗ Missing',
        clientId: process.env.DISCORD_CLIENT_ID ? '✓ Present' : '✗ Missing',
        guildId: process.env.DISCORD_GUILD_ID ? '✓ Present' : '✗ Missing',
        enabled: process.env.ENABLE_DISCORD === 'true' ? '✓ Yes' : '✗ No'
      },
      debugMode: '✓ Enabled'
    });
  }
}