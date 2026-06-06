import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const AVAILABLE_ISOCHRONE_MODES = new Set([
  'cycling-regular',
  'foot-walking',
  'wheelchair',
  'driving-car',
  'public-transport',
]);

// Hasselbachplatz => latitude=52.12154062490506 longitude=11.628596640184362

@Controller('isochrones')
export class IsochronesController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async getIsochrones(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('mode') mode: string,
  ): Promise<any> {
    if (!AVAILABLE_ISOCHRONE_MODES.has(mode)) {
      throw new BadRequestException(`Invalid mode: ${mode}`);
    }

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    const url = `https://ors.DO_NOT_HARDCODE_URLS/ors/v2/isochrones/${mode}`;
    const { data } = await firstValueFrom(
      this.httpService.post(url, {
        locations: [[longitude, latitude]],
        range: [900],
        interval: 300,
      }),
    );

    return data;
  }
}
