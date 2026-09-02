import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { errorHandler, notFoundHandler } from './common/middleware/error-handler.middleware';
import { logger } from './common/utils/logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Use Winston for NestJS internal logs
    logger: {
      log: (msg: string) => logger.info(msg),
      error: (msg: string, trace: string) => logger.error(msg, { trace }),
      warn: (msg: string) => logger.warn(msg),
      debug: (msg: string) => logger.debug(msg),
      verbose: (msg: string) => logger.verbose?.(msg),
    } as unknown as Logger,
  });

  // Route prefixes — matches Node repo's /health and /api/v1 structure
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // CORS — same logic as Node repo
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed`));
      }
    },
    credentials: true,
  });

  // Swagger docs
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('My App API')
      .setDescription('REST API — generated from OpenAPI spec')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Graceful shutdown — from Node repo
  const shutdown = (signal: string): void => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);

  // Express-level error handling (same as Node repo — errorHandler must be last).
  // Must be attached after app.listen(), since that's what triggers Nest's internal
  // route binding — attaching earlier put these ahead of every controller route,
  // so they caught (and 404'd) every request before Nest's router ever ran.
  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.use(notFoundHandler);
  httpAdapter.use(errorHandler);

  logger.info('Server started successfully');
  logger.info(`Port: ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${port}/health`);
  logger.info(`API: http://localhost:${port}/api/v1`);
  logger.info(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
