import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { OnboardingService } from './onboarding.service';
import { OnboardingController, PublicOnboardingController } from './onboarding.controller';

@Module({
  imports: [AuthModule, DeliveryModule],
  controllers: [OnboardingController, PublicOnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}