import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class BlockGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { user } = ctx.switchToHttp().getRequest();
    if (!user) return true;
    const dbUser = await this.usersService.findByEmail(user.email);
    if (dbUser?.isBlocked) throw new ForbiddenException('Account is blocked');
    return true;
  }
}
