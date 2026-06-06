import { Body, Controller, Post } from '@nestjs/common';
import { OverpassService } from '../overpass/overpass.service';
import { GeoJsonFeatureCollection, overpassToGeoJson } from './osm.utils';

interface PolygonGeoJson {
  type: 'Polygon';
  coordinates: number[][][]; // [ring][point][lon, lat]
}

interface OsmTag {
  name: string;
  value: string;
}

interface OsmDataRequest {
  geojson: PolygonGeoJson;
  tags?: OsmTag[];
}

@Controller('osm')
export class OsmController {
  constructor(private readonly overpass: OverpassService) {}

  @Post('data')
  async getOSMData(
    @Body() body: OsmDataRequest,
  ): Promise<GeoJsonFeatureCollection> {
    const ring = body.geojson.coordinates[0] as [number, number][];
    const data = await this.overpass.getDataInPolygon(ring, body.tags);
    return overpassToGeoJson(data);
  }
}
