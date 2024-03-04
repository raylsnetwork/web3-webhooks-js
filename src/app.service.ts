import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Subscribe } from '@prisma/client';
import { CreateDTO } from './app.dto';

@Injectable()
export class AppService {
  private prisma: PrismaService;
  constructor(private _prisma: PrismaService) {
    this.prisma = _prisma;
  }
  getSubscribe(): Promise<Subscribe[]> {
    return this.prisma.subscribe.findMany();
  }
  createSubscribe(subscribe: CreateDTO) {
    return this.prisma.subscribe.create({
      data: subscribe,
    });
  }
}
