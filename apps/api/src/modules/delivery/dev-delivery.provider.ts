import { Injectable, Logger } from '@nestjs/common';
import {
  DeliveryProvider,
  InvitationEmailPayload,
  OnboardingEmailPayload,
  VerificationEmailPayload,
} from './delivery-provider';

@Injectable()
export class DevDeliveryProvider implements DeliveryProvider {
  readonly name = 'dev';
  private readonly logger = new Logger(DevDeliveryProvider.name);

  async sendInvitationEmail(payload: InvitationEmailPayload): Promise<void> {
    // Naming only — never log the raw token. The plaintext token is surfaced to
    // the caller through the API response in non-production environments.
    this.logger.log(
      `[dev-delivery] Invitation for ${payload.email} (${payload.roleName || 'no role'}) ` +
        `expiresAt=${payload.expiresAt.toISOString()}`,
    );
  }

  async sendVerificationEmail(payload: VerificationEmailPayload): Promise<void> {
    this.logger.log(
      `[dev-delivery] Email verification for ${payload.email} ` +
        `expiresAt=${payload.expiresAt.toISOString()}`,
    );
  }

  async sendOnboardingEmail(payload: OnboardingEmailPayload): Promise<void> {
    this.logger.log(
      `[dev-delivery] Onboarding link for ${payload.email} ` +
        `expiresAt=${payload.expiresAt.toISOString()}`,
    );
  }
}