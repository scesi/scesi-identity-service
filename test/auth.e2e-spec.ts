import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import request, { Response as SupertestResponse } from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/filters/global-exception.filter';

const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const email = `user-${unique}@example.com`;
const password = 'TestPass123!';

interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

function tokens(res: SupertestResponse): TokenPair {
  return res.body as TokenPair;
}

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));

    await app.init();

    await request(app.getHttpServer())
      .post('/users')
      .send({ email, firstName: 'Test', lastName: 'User', password })
      .expect(201);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /users registers a new user (201)', async () => {
    const registerEmail = `register-${unique}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: registerEmail,
        firstName: 'Registered',
        lastName: 'User',
        password,
      })
      .expect(201);

    const user = res.body as UserResponse;
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(registerEmail);
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('POST /auth/login returns a token pair (200)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const { access_token, refresh_token } = tokens(res);
    expect(access_token).toBeTruthy();
    expect(refresh_token).toBeTruthy();
    expect(access_token.split('.')).toHaveLength(3);
  });

  it('POST /auth/login rejects invalid credentials (401)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'WrongPass99!' })
      .expect(401);
  });

  it('POST /auth/login validates the body (400)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: '1' })
      .expect(400);
  });

  it('POST /auth/refresh rotates a valid token (200)', async () => {
    const { refresh_token } = tokens(
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200),
    );

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token })
      .expect(200);

    const { refresh_token: rotated } = tokens(res);
    expect(rotated).not.toBe(refresh_token);
  });

  it('POST /auth/refresh rejects a rotated token (401)', async () => {
    const { refresh_token } = tokens(
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200),
    );

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token })
      .expect(401);
  });

  it('POST /auth/refresh rejects a tampered token (401)', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: 'not-a-valid-token' })
      .expect(401);
  });

  it('POST /auth/logout revokes the refresh token (200)', async () => {
    const { access_token, refresh_token } = tokens(
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200),
    );

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${access_token}`)
      .send({ refresh_token })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token })
      .expect(401);
  });

  it('POST /auth/logout requires a bearer token (401)', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refresh_token: 'anything' })
      .expect(401);
  });

  it('POST /auth/logout-all revokes every token for the user (200)', async () => {
    const { access_token, refresh_token } = tokens(
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200),
    );

    await request(app.getHttpServer())
      .post('/auth/logout-all')
      .set('Authorization', `Bearer ${access_token}`)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token })
      .expect(401);
  });
});
