import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { AchievementService } from './achievement.service';

@Module({
    imports: [AuthModule],
    providers: [ProgressService, AchievementService],
    controllers: [ProgressController],
    exports: [ProgressService]
})
export class ProgressModule { }
