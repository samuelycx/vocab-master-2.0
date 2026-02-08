import { Module } from '@nestjs/common';
import { PkService } from './pk.service';
import { PkGateway } from './pk.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [PkService, PkGateway],
    exports: [PkService]
})
export class PkModule { }
