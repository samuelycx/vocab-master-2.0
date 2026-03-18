import { Test, TestingModule } from '@nestjs/testing';
import { WordService } from './word.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WordService', () => {
  let service: WordService;
  const prisma = {
    word: {
      findMany: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WordService>(WordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('loads category sessions without using unsafe raw sql', async () => {
    prisma.word.findMany.mockResolvedValue([
      { id: 'w1', text: 'alpha', category: 'TOEFL' },
    ]);

    await service.getWordsForSession(10, 'TOEFL');

    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
    expect(prisma.word.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: 'TOEFL' },
        take: 10,
      }),
    );
  });
});
