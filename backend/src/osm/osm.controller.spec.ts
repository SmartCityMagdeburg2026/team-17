import { Test, TestingModule } from '@nestjs/testing';
import { OsmController } from './osm.controller';
import { OverpassService } from '../overpass/overpass.service';

describe('OsmController', () => {
  let controller: OsmController;
  let overpassService: OverpassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OsmController],
      providers: [
        {
          provide: OverpassService,
          useValue: {
            getDataInPolygon: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OsmController>(OsmController);
    overpassService = module.get<OverpassService>(OverpassService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call overpass service with multiple tags', async () => {
    const body: any = {
      geojson: {
        type: 'Polygon' as const,
        coordinates: [[[11.6, 52.1], [11.7, 52.1], [11.7, 52.2], [11.6, 52.2], [11.6, 52.1]]],
      },
      tags: [
        { name: 'shop', value: 'supermarket' },
        { name: 'amenity', value: 'pharmacy' }
      ],
    };

    const mockOverpassData = {
      elements: [
        {
          type: 'node',
          id: 1,
          lat: 52.15,
          lon: 11.65,
          tags: { name: 'Test Pharmacy', amenity: 'pharmacy' }
        }
      ]
    };

    (overpassService.getDataInPolygon as jest.Mock).mockResolvedValue(mockOverpassData);

    const result = await controller.getOSMData(body);

    expect(overpassService.getDataInPolygon).toHaveBeenCalledWith(
      body.geojson.coordinates[0],
      body.tags,
    );

    expect(result).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'node/1',
          geometry: {
            type: 'Point',
            coordinates: [11.65, 52.15],
          },
          properties: {
            name: 'Test Pharmacy',
            amenity: 'pharmacy',
            osm_id: 1,
            osm_type: 'node',
          },
        },
      ],
    });
  });
});
