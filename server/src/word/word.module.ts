import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { WordController } from './word.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [PrismaModule, ProgressModule],
  providers: [WordService],
  controllers: [WordController],
  exports: [WordService]
})
export class WordModule { }
