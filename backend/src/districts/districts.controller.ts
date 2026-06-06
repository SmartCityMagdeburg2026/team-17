import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import districtData from './district_data.json';

@Controller('districts')
export class DistrictsController {
  constructor() {}

  @Get()
  getDistrict(@Query('name') name: string) {
    if (!districtData.some((district) => district.district === name)) {
      throw new NotFoundException(`District with name ${name} not found`);
    }

    return districtData.find((district) => district.district === name);
  }
}
