import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WordService } from './word.service';
import { WordController } from './word.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [PrismaModule, ProgressModule, AuthModule],
  providers: [WordService],
  controllers: [WordController],
  exports: [WordService]
})
export class WordModule { }
