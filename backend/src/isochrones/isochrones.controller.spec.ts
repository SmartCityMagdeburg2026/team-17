import { Test, TestingModule } from '@nestjs/testing';
import { IsochronesController } from './isochrones.controller';

describe('IsochronesController', () => {
  let controller: IsochronesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IsochronesController],
    }).compile();

    controller = module.get<IsochronesController>(IsochronesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
