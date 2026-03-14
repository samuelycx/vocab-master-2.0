import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('register -> login -> me -> logout', async () => {
    const username = `webuser_${Date.now()}`;
    const password = 'secret123';

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password })
      .expect(201);

    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.user.username).toBe(username);
    expect(registerRes.body.user.passwordHash).toBeUndefined();

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeTruthy();
    expect(loginRes.body.user.username).toBe(username);

    const token = loginRes.body.token;

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.username).toBe(username);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
