// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { checkRequiredEnvVars } from "./startup.check";

async function bootstrap() {
  try {
    // Vérifier les variables d'environnement avant de démarrer l'application
    checkRequiredEnvVars();

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Gérer la fermeture gracieuse
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Starting graceful shutdown...');
      await app.close();
      process.exit(0);
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();