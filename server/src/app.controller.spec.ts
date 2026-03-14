import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminService } from './admin/admin.service';
import { ProgressService } from './progress/progress.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const adminServiceMock = {
      getSystemConfigs: jest.fn(),
    };
    const progressServiceMock = {
      getLeaderboard: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ProgressService, useValue: progressServiceMock },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
