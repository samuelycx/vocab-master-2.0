
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProgressModule } from './progress/progress.module';
import { WordModule } from './word/word.module';
import { PkModule } from './pk/pk.module';
import { SocialModule } from './social/social.module';
import { AdminModule } from './admin/admin.module';
import { createUploadsStaticOptions, createWebStaticOptions } from './static-assets';

@Module({
  imports: [
    ServeStaticModule.forRoot(createWebStaticOptions()),
    ServeStaticModule.forRoot(createUploadsStaticOptions()),
    PrismaModule,
    AuthModule,
    WordModule,
    ProgressModule,
    SocialModule,
    PkModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
