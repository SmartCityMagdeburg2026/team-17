import { Test, TestingModule } from '@nestjs/testing';
import { OverpassService } from './overpass.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('OverpassService', () => {
  let service: OverpassService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [OverpassService],
    }).compile();

    service = module.get<OverpassService>(OverpassService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call overpass API with correct query', async () => {
    const polygon: [number, number][] = [
      [11.6, 52.1],
      [11.7, 52.1],
      [11.7, 52.2],
      [11.6, 52.2],
      [11.6, 52.1],
    ];

    const mockResponse: AxiosResponse = {
      data: { elements: [{ type: 'node', id: 1, tags: { amenity: 'cinema' } }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    const result = await service.getDataInPolygon(polygon);

    expect(httpService.post).toHaveBeenCalledWith(
      'https://overpass.DO_NOT_HARDCODE_URLS/api/interpreter',
      expect.stringContaining(encodeURIComponent('poly:"52.1 11.6 52.1 11.7 52.2 11.7 52.2 11.6 52.1 11.6"')),
      expect.any(Object),
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should call overpass API with custom tag', async () => {
    const polygon: [number, number][] = [
      [11.6, 52.1],
      [11.7, 52.1],
      [11.7, 52.2],
      [11.6, 52.2],
      [11.6, 52.1],
    ];

    const mockResponse: AxiosResponse = {
      data: { elements: [{ type: 'node', id: 1, tags: { leisure: 'park' } }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    const result = await service.getDataInPolygon(polygon, [{ name: 'leisure', value: 'park' }]);

    expect(httpService.post).toHaveBeenCalledWith(
      'https://overpass.DO_NOT_HARDCODE_URLS/api/interpreter',
      expect.stringContaining(encodeURIComponent('node["leisure"="park"]')),
      expect.any(Object),
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should call overpass API with multiple tags', async () => {
    const polygon: [number, number][] = [
      [11.6, 52.1],
      [11.6, 52.1],
    ];

    const mockResponse: AxiosResponse = {
      data: { elements: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    await service.getDataInPolygon(polygon, [
      { name: 'shop', value: 'supermarket' },
      { name: 'amenity', value: 'pharmacy' }
    ]);

    expect(httpService.post).toHaveBeenCalledWith(
      'https://overpass.DO_NOT_HARDCODE_URLS/api/interpreter',
      expect.stringContaining(encodeURIComponent('node["shop"="supermarket"]')),
      expect.any(Object),
    );
    expect(httpService.post).toHaveBeenCalledWith(
      'https://overpass.DO_NOT_HARDCODE_URLS/api/interpreter',
      expect.stringContaining(encodeURIComponent('node["amenity"="pharmacy"]')),
      expect.any(Object),
    );
  });
});
