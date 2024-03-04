import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Subscribe } from '@prisma/client';
import { ApiBody } from '@nestjs/swagger';
import { CreateDTO } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getSubscribe(): Promise<Subscribe[]> {
    return this.appService.getSubscribe();
  }

  @Post()
  @ApiBody({ type: CreateDTO })
  createSubscribe(@Body() subscribe: CreateDTO) {
    return this.appService.createSubscribe(subscribe);
  }
}
