export interface InvitationEmailPayload {
  tenantName: string;
  email: string;
  roleName?: string;
  token: string;
  expiresAt: Date;
}

export interface VerificationEmailPayload {
  email: string;
  token: string;
  expiresAt: Date;
}

export interface OnboardingEmailPayload {
  email: string;
  token: string;
  expiresAt: Date;
}

export interface DeliveryProvider {
  readonly name: string;
  sendInvitationEmail(payload: InvitationEmailPayload): Promise<void>;
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
  sendOnboardingEmail(payload: OnboardingEmailPayload): Promise<void>;
}

export const DELIVERY_PROVIDER = 'DELIVERY_PROVIDER';

export type DeliveryProviderName = 'dev' | 'none';

/**
 * Resolve the delivery transport for the current environment.
 *
 * `dev` is the Phase-1 development/log transport and must never be silently
 * selected in production: a production deployment has to explicitly opt into
 * `none` (no-op) until a real provider is integrated (freezing spec D-02,
 * Phase 9 delivery integration). Any unknown provider name is a config error.
 */
export function resolveDeliveryProviderName(
  env: string,
  configured: string | undefined,
): DeliveryProviderName {
  const value = (configured || 'dev').toLowerCase();

  if (value === 'none') {
    return 'none';
  }
  if (value === 'dev') {
    if (env === 'production') {
      throw new Error(
        "DELIVERY_PROVIDER=dev is not allowed in production. Set DELIVERY_PROVIDER=none until a production email provider is integrated (Phase 9).",
      );
    }
    return 'dev';
  }

  throw new Error(`Unsupported DELIVERY_PROVIDER '${value}'.`);
}