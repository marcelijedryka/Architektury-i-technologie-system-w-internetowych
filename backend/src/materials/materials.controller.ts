import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile, Logger, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BlockGuard } from '../auth/guards/block.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('materials')
export class MaterialsController {
  private readonly logger = new Logger(MaterialsController.name);

  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  search(@Query() query: { continent?: string; country?: string; city?: string; phrase?: string; dateFrom?: string; dateTo?: string }) {
    return this.materialsService.search(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, BlockGuard)
  myMaterials(@CurrentUser() user: any) {
    return this.materialsService.findByUploader(user.email);
  }

  @Get('my-liked-ids')
  @UseGuards(JwtAuthGuard)
  myLikedIds(@CurrentUser() user: any) {
    return this.materialsService.getLikedIds(user.email);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard, BlockGuard)
  toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.materialsService.toggleLike(id, user.email);
  }

  @Get('admin/new-since/:since')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  newSince(@Param('since') since: string) {
    return this.materialsService.findNewSince(decodeURIComponent(since));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, BlockGuard)
  @Roles('CREATOR', 'ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Upload attempt by ${user?.email} (role: ${user?.role})`);
    this.logger.log(`DTO: ${JSON.stringify(dto)}`);
    this.logger.log(`File: ${file ? `${file.originalname} ${file.mimetype} ${file.size}b` : 'MISSING'}`);

    if (!file) throw new BadRequestException('No file uploaded');

    try {
      const result = await this.materialsService.create(dto, file, user.email);
      this.logger.log(`Upload success: materialId=${result.materialId}`);
      return result;
    } catch (err: any) {
      this.logger.error(`Upload failed: ${err?.message}`, err?.stack);
      throw err;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, BlockGuard)
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto, @CurrentUser() user: any) {
    return this.materialsService.update(id, dto, user.email, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, BlockGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role === 'ADMIN') return this.materialsService.hardDelete(id);
    return this.materialsService.softDelete(id, user.email);
  }
}
