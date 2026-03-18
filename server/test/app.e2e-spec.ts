import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { AuthController } from './../src/auth/auth.controller';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authController: AuthController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    authController = app.get(AuthController);
  });

  afterEach(async () => {
    await app.close();
  });

  it('register -> login -> me -> logout', async () => {
    const username = `webuser_${Date.now()}`;
    const password = 'secret123';

    const registerRes = await authController.register({ username, password });

    expect(registerRes.success).toBe(true);
    expect(registerRes.token).toBeTruthy();
    expect(registerRes.user.username).toBe(username);
    expect(registerRes.user.passwordHash).toBeUndefined();

    const loginRes = await authController.login({ username, password });

    expect(loginRes.success).toBe(true);
    expect(loginRes.token).toBeTruthy();
    expect(loginRes.user.username).toBe(username);

    const token = loginRes.token;

    const meRes = await authController.me(`Bearer ${token}`);

    expect(meRes.success).toBe(true);
    expect(meRes.user.username).toBe(username);

    await authController.logout(`Bearer ${token}`);

    await expect(authController.me(`Bearer ${token}`)).rejects.toThrow(UnauthorizedException);
  });
});
