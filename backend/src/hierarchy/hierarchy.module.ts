import { Module } from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';
import { HierarchyController } from './hierarchy.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [HierarchyService],
  controllers: [HierarchyController],
  exports: [HierarchyService],
})
export class HierarchyModule {}
