import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('hierarchy')
export class HierarchyController {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @Get('continents')
  listContinents() { return this.hierarchyService.listContinents(); }

  @Get('continents/:id/regions')
  listRegions(@Param('id') id: string) { return this.hierarchyService.listRegions(id); }

  @Get('regions/:id/cities')
  listCities(@Param('id') id: string) { return this.hierarchyService.listCities(id); }

  @Get('cities/:id/streets')
  listStreets(@Param('id') id: string) { return this.hierarchyService.listStreets(id); }

  @Post('continents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createContinent(@Body() body: { name: string }) { return this.hierarchyService.createContinent(body.name); }

  @Post('continents/:id/regions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createRegion(@Param('id') id: string, @Body() body: { name: string }) {
    return this.hierarchyService.createRegion(id, body.name);
  }

  @Post('regions/:id/cities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createCity(@Param('id') id: string, @Body() body: { name: string }) {
    return this.hierarchyService.createCity(id, body.name);
  }

  @Post('cities/:id/streets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createStreet(@Param('id') id: string, @Body() body: { name: string }) {
    return this.hierarchyService.createStreet(id, body.name);
  }
}
