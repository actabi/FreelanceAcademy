import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";

// src/main.ts
const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug']
  });