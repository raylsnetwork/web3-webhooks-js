import { Module } from '@nestjs/common';
import { SubscribeController } from './subscribe.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';


@Module({
  imports: [],
  controllers: [SubscribeController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
