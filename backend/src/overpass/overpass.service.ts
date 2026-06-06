import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OverpassResponse } from '../osm/osm.utils';

const OVERPASS_API_URL = 'https://overpass.DO_NOT_HARDCODE_URLS/api/interpreter';

@Injectable()
export class OverpassService {
  constructor(private readonly httpService: HttpService) {}

  async getDataInPolygon(
    polygon: [number, number][],
    tags: { name: string; value: string }[] = [
      { name: 'amenity', value: 'cinema' },
    ],
  ): Promise<OverpassResponse> {
    const polyString = polygon.map(([lon, lat]) => `${lat} ${lon}`).join(' ');

    const query = `
      [out:json];
      (
        ${tags
          .map(
            (tag) => `
          node["${tag.name}"="${tag.value}"](poly:"${polyString}");
          way["${tag.name}"="${tag.value}"](poly:"${polyString}");
          relation["${tag.name}"="${tag.value}"](poly:"${polyString}");
        `,
          )
          .join('')}
      );
      out center;
    `;

    const response = await firstValueFrom(
      this.httpService.post<OverpassResponse>(
        OVERPASS_API_URL,
        `data=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return response.data;
  }
}
