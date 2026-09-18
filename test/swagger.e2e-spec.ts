import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import request, { Response as SupertestResponse } from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/filters/global-exception.filter';
import { setupSwagger } from '../src/swagger';

const EXPECTED_PATHS = [
  '/api/v1',
  '/api/v1/health',
  '/api/v1/users',
  '/api/v1/users/login',
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/logout-all',
  '/api/v1/admin/users/create',
];

interface OpenApiDocument {
  info: { title: string; description: string; version: string };
  components: {
    securitySchemes: Record<
      string,
      { type: string; scheme: string; bearerFormat?: string }
    >;
  };
  paths: Record<
    string,
    Record<
      string,
      { tags?: string[]; summary?: string; responses: Record<string, unknown> }
    >
  >;
}

describe('Swagger documentation (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('serves the Swagger UI at /api/v1/docs', () => {
    return request(app.getHttpServer())
      .get('/api/v1/docs')
      .expect(200)
      .expect((res: SupertestResponse) => {
        expect(res.text.toLowerCase()).toContain('swagger');
      });
  });

  it('serves a valid OpenAPI document at /api/v1/docs-json', () => {
    return request(app.getHttpServer())
      .get('/api/v1/docs-json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res: SupertestResponse) => {
        const spec = res.body as OpenApiDocument;
        expect(spec.info.title).toBe('SCESI Identity Service API');
        expect(spec.info.version).toBe('1.0.0');
        expect(spec.info.description).toBeTruthy();
        expect(spec.components.securitySchemes.bearer).toEqual(
          expect.objectContaining({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          }),
        );
      });
  });

  it('documents every endpoint with tags and a summary', () => {
    return request(app.getHttpServer())
      .get('/api/v1/docs-json')
      .expect(200)
      .expect((res: SupertestResponse) => {
        const spec = res.body as OpenApiDocument;
        const paths = Object.keys(spec.paths);
        for (const path of EXPECTED_PATHS) {
          expect(paths).toContain(path);
          const operations = Object.values(spec.paths[path]);
          for (const operation of operations) {
            expect(operation.tags).toBeTruthy();
            expect(operation.summary).toBeTruthy();
          }
        }
      });
  });

  it('documents the admin create error responses (401, 403, 409)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/docs-json')
      .expect(200)
      .expect((res: SupertestResponse) => {
        const spec = res.body as OpenApiDocument;
        const operation = spec.paths['/api/v1/admin/users/create'].post;
        expect(operation.responses['401']).toBeTruthy();
        expect(operation.responses['403']).toBeTruthy();
        expect(operation.responses['409']).toBeTruthy();
      });
  });
});
