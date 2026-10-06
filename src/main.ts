import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de versión de la API (spec: /api/v1/*)
  app.setGlobalPrefix('api/v1');

  // Configurar ValidationPipe globalmente para validación automática
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no whitelist
      transform: true, // Transforma objetos automáticamente
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
    }),
  );

  // Configurar filtro de excepciones global
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  // Documentación de la API (Swagger UI en /api/v1/docs, JSON en /api/v1/docs-json).
  // Desactivar con SWAGGER_ENABLED=false.
  if (process.env.SWAGGER_ENABLED !== 'false') {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT ?? 8000, '0.0.0.0');
}
void bootstrap();
