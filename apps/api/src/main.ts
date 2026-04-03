import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Health check endpoint (no auth required)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/health', (_req: any, res: any) => {
    res.json({ status: 'ok', service: 'crmpro-api', timestamp: new Date().toISOString() });
  });

  const config = new DocumentBuilder()
    .setTitle('CRMPro API')
    .setDescription('Professional CRM for Educational Centers')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.log(`CRMPro API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
