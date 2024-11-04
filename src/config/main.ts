// src/main.ts
const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug']
  });