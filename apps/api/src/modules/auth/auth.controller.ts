import { Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginThrottleGuard } from './login-throttle.guard';
import { TenantedLoginDto, RefreshDto, RegisterDto, VerifyEmailDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ObjectScope } from '../../common/decorators/object-scope.decorator';
import { ObjectScopeGuard } from '../../common/guards/object-scope.guard';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'), ObjectScopeGuard)
  @ObjectScope({ type: 'authOnly' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  getMe(@CurrentUser() user: Record<string, unknown>) {
    return { success: true as const, data: user };
  }

  @Post('login')
  @UseGuards(LoginThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and return tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 423, description: 'Account temporarily locked' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() dto: TenantedLoginDto, @Req() req: Request) {
    const result = await this.authService.login(
      dto.email,
      dto.password,
      dto.tenantSlug,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
    return { success: true as const, data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the access token' })
  async refresh(@Body() dto: RefreshDto) {
    const result = await this.authService.refresh(dto.refreshToken);
    return { success: true as const, data: result };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'), ObjectScopeGuard)
  @ObjectScope({ type: 'self', model: 'session' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out the current session (revoke this device)' })
  @ApiResponse({ status: 200, description: 'Current session revoked' })
  async logout(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('sessionId') sessionId: string,
  ) {
    const result = await this.authService.logout(tenantId, userId, sessionId);
    return { success: true as const, data: result };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user within a tenant (invitation-driven by default)',
  })
  @ApiResponse({ status: 201, description: 'Registration successful; verification email sent' })
  @ApiResponse({ status: 400, description: 'Missing/invalid invitation or policy violation' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('email/verification-request')
  @UseGuards(AuthGuard('jwt'), ObjectScopeGuard)
  @ObjectScope({ type: 'authOnly' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an email verification token for the current user' })
  async requestVerification(@CurrentUser('sub') userId: string) {
    return this.authService.requestVerificationEmail(userId);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an email address using the verification token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }
}