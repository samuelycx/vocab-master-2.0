
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProgressModule } from './progress/progress.module';
import { WordModule } from './word/word.module';
import { PkModule } from './pk/pk.module';
import { SocialModule } from './social/social.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // 寻找前端静态文件的路径 (Robust path resolution)
      rootPath: (() => {
        const paths = [
          join(process.cwd(), 'client', 'dist'), // PM2 从根目录启动时
          join(process.cwd(), '..', 'client', 'dist'), // 直接在 server 目录下启动时
          join(__dirname, '..', '..', '..', 'client', 'dist'), // 嵌套在 dist/src 下时
        ];
        const { existsSync } = require('fs');
        for (const p of paths) {
          if (existsSync(join(p, 'index.html'))) return p;
        }
        return paths[0]; // 默认返回
      })(),
    }),
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
