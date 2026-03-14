import { Test, TestingModule } from '@nestjs/testing';
import { WordService } from './word.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WordService', () => {
  let service: WordService;

  beforeEach(async () => {
    const prismaServiceMock = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<WordService>(WordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
