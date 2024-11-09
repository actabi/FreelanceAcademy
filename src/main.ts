// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getConnectionToken } from '@nestjs/typeorm';

async function bootstrap() {
  // Vérification des variables d'environnement requises
  const requiredEnvVars = [
      'DATABASE_URL',
      'REDIS_URL',
      'DISCORD_TOKEN',
      'DISCORD_CHANNEL_ID'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:');
      missingEnvVars.forEach(envVar => {
          console.error(`- ${envVar}`);
      });
      process.exit(1);
  }

  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'], // Activer tous les niveaux de log
  });

    // Récupérer la connexion TypeORM
    const connection = app.get(getConnectionToken());
    if (connection.isConnected) {
      console.log('PostgreSQL Database connected successfully');
    }

  // Gestion gracieuse de l'arrêt
  process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Starting graceful shutdown...');
      await app.close();
      process.exit(0);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
