import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    console.log('[JwtStrategy] secretOrKey:', process.env.JWT_SECRET ? `"${process.env.JWT_SECRET}"` : 'UNDEFINED — using fallback "change-me"');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.['access_token'] ?? null;
          const cookieKeys = Object.keys(req?.cookies ?? {});
          console.log(`[JWT] ${req.method} ${req.url} | cookies present: [${cookieKeys.join(', ')}] | access_token: ${token ? 'FOUND' : 'MISSING'}`);
          return token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me',
    });
  }

  validate(payload: { sub: string; email: string; role: string; name: string; isBlocked: boolean }) {
    return { email: payload.email, role: payload.role, name: payload.name, isBlocked: payload.isBlocked };
  }
}
