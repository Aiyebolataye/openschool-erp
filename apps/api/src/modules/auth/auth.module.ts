import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PasswordService } from './password.service';
import { LoginThrottleGuard } from './login-throttle.guard';
import { LoginAttemptsService } from './login-attempts.service';
import { DeliveryModule } from '../delivery/delivery.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    PassportModule,
    DeliveryModule,
    SessionModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.expiresIn', '15m') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PasswordService,
    LoginThrottleGuard,
    LoginAttemptsService,
  ],
  exports: [AuthService, PasswordService],
})
export class AuthModule {}