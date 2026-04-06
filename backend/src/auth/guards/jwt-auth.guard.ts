import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.error(`JWT verification failed: ${info?.message ?? info ?? err?.message ?? 'unknown'}`);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
