import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PkService } from './pk.service';
import { PkGateway } from './pk.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [PkService, PkGateway],
    exports: [PkService]
})
export class PkModule { }
