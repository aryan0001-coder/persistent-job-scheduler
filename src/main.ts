import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MetricsService } from './common/metrics.service';
import { SchedulerService } from './modules/scheduler/scheduler.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Job Scheduler API')
    .setDescription('API documentation for the persistent job scheduler')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const metricsService = app.get(MetricsService);
  app
    .getHttpAdapter()
    .getInstance()
    .get('/metrics', async (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(await metricsService.getMetrics());
    });
  await app.listen(process.env.PORT ?? 3000);

  // Graceful shutdown
  const schedulerService = app.get(SchedulerService);
  const shutdown = async () => {
    console.log('Graceful shutdown started...');
    await schedulerService.shutdown();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

void bootstrap();
