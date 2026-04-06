import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      authProvider: 'local',
    });
  }

  async validateLocalUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  issueJwt(user: User): string {
    console.log('[AuthService] Signing JWT with secret:', process.env.JWT_SECRET ? `"${process.env.JWT_SECRET}"` : 'UNDEFINED — using fallback "change-me"');
    const payload = { sub: user.email, email: user.email, role: user.role, name: user.name, isBlocked: user.isBlocked };
    return this.jwtService.sign(payload);
  }
}
