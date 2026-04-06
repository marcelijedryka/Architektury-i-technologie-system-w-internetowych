import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listAll() {
    return this.usersService.listAll();
  }

  @Post(':email/block')
  block(@Param('email') email: string) {
    return this.usersService.blockUser(email);
  }

  @Post(':email/unblock')
  unblock(@Param('email') email: string) {
    return this.usersService.unblockUser(email);
  }
}
