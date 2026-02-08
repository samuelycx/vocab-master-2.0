import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { AchievementService } from './achievement.service';

@Module({
    providers: [ProgressService, AchievementService],
    controllers: [ProgressController],
    exports: [ProgressService]
})
export class ProgressModule { }
