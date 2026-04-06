import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(dto);
    const token = this.authService.issueJwt(user);
    res.cookie('access_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { email: user.email, name: user.name, role: user.role };
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  async login(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = this.authService.issueJwt(req.user);
    await this.usersService.updateLastLogin(req.user.email);
    res.cookie('access_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { email: req.user.email, name: req.user.name, role: req.user.role };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const token = this.authService.issueJwt(req.user);
    await this.usersService.updateLastLogin(req.user.email);
    res.cookie('access_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    // Re-read user from DB so role/block changes take effect on next page load
    const fresh = await this.usersService.findByEmail(user.email);
    if (!fresh) return user;
    const token = this.authService.issueJwt(fresh);
    res.cookie('access_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { email: fresh.email, name: fresh.name, role: fresh.role, isBlocked: fresh.isBlocked };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }
}
