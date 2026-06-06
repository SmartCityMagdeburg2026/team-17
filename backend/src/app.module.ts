import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IsochronesController } from './isochrones/isochrones.controller';
import { HttpModule } from "@nestjs/axios";
import { OsmController } from './osm/osm.controller';
import { OverpassService } from './overpass/overpass.service';
import { StatisticsController } from './statistics/statistics.controller';
import { StatisticsService } from './statistics/statistics.service';
import { DistrictsController } from './districts/districts.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController, IsochronesController, OsmController, StatisticsController, DistrictsController],
  providers: [AppService, OverpassService, StatisticsService],
})
export class AppModule {}
