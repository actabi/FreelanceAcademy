// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { checkRequiredEnvVars } from "./startup.check";
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Vérifier les variables d'environnement avant de démarrer l'application
    checkRequiredEnvVars();

    const app = await NestFactory.create(AppModule, {
      // Activer tous les niveaux de log en développement
      logger: isDevelopment 
        ? ['error', 'warn', 'log', 'debug', 'verbose']
        : ['error', 'warn', 'log'],
    });

    // Configuration CORS pour le développement
    if (isDevelopment) {
      app.enableCors({
        origin: true,
        credentials: true,
      });
    }

    // Gestion de la fermeture gracieuse
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received. Starting graceful shutdown...');
      await app.close();
      process.exit(0);
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    logger.log(`Application is running in ${process.env.NODE_ENV} mode on port ${port}`);
    
    if (isDevelopment) {
      logger.debug('Debug mode is enabled');
      logger.debug(`Application started with Discord ${process.env.ENABLE_DISCORD === 'true' ? 'enabled' : 'disabled'}`);
    }
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();