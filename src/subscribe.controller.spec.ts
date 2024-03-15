import { Test, TestingModule } from '@nestjs/testing';
import { SubscribeController } from './subscribe.controller';
import { AppService } from './app.service';

describe('SubscribeController', () => {
  let subscribeController: SubscribeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SubscribeController],
      providers: [AppService],
    }).compile();

    subscribeController = app.get<SubscribeController>(SubscribeController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(SubscribeController.getHello()).toBe('Hello World!');
    });
  });
});
