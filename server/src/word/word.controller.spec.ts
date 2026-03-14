import { Test, TestingModule } from '@nestjs/testing';
import { WordController } from './word.controller';
import { WordService } from './word.service';
import { ProgressService } from '../progress/progress.service';

describe('WordController', () => {
  let controller: WordController;

  beforeEach(async () => {
    const wordServiceMock = {};
    const progressServiceMock = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordController],
      providers: [
        { provide: WordService, useValue: wordServiceMock },
        { provide: ProgressService, useValue: progressServiceMock },
      ],
    }).compile();

    controller = module.get<WordController>(WordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
