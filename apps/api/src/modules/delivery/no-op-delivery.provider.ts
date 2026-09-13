import { Injectable } from '@nestjs/common';
import {
  DeliveryProvider,
  InvitationEmailPayload,
  OnboardingEmailPayload,
  VerificationEmailPayload,
} from './delivery-provider';

/**
 * No-op delivery transport. `none` is the only delivery provider permitted in
 * production during Phase 1 (no third-party email provider before Phase 9).
 */
@Injectable()
export class NoOpDeliveryProvider implements DeliveryProvider {
  readonly name = 'none';

  async sendInvitationEmail(_payload: InvitationEmailPayload): Promise<void> {
    // no-op
  }

  async sendVerificationEmail(_payload: VerificationEmailPayload): Promise<void> {
    // no-op
  }

  async sendOnboardingEmail(_payload: OnboardingEmailPayload): Promise<void> {
    // no-op
  }
}