import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InstitutionConfigurationsService } from './institution-configurations.service';
import { InstitutionSettingsService } from './institution-settings.service';
import {
  assertNotReservedConfigKey,
  isReservedConfigKey,
  reservedNamespaceOf,
} from './reserved-config-namespaces';

/**
 * D-2 (locked, Option 1) — Finance is the sole authoritative owner of financial
 * configuration. Institution Management must not create an independent
 * `financial.*` source of truth, so the namespace is rejected on every write
 * path of both institution-scoped configuration tables.
 *
 * Scope note: this covers the ownership reservation only. Per-category JSON
 * schema validation is NOT implemented (no specification defines the schemas)
 * and the Finance gateway credential mechanism is NOT implemented (no secret
 * store exists in this repository). See the D-2 implementation report.
 */

function configurationHarness() {
  const mocks = {
    institutionConfiguration: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new InstitutionConfigurationsService(
    mocks as any,
    { emitAsync: jest.fn() } as any,
    { record: jest.fn() } as any,
  );
  return { mocks, service };
}

function settingsHarness() {
  const mocks = {
    institutionSetting: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new InstitutionSettingsService(
    mocks as any,
    { emitAsync: jest.fn() } as any,
    { record: jest.fn() } as any,
  );
  return { mocks, service };
}

const RESERVED_KEYS = [
  'financial',
  'financial.tax',
  'financial.tax.default_rate',
  'financial.payment_gateways.paystack.secret_key',
  'financial.currency',
  'financial.numbering.invoice',
  'FINANCIAL.tax',
  '  financial.tax  ',
];

describe('reservedConfigNamespaces (D-2 Option 1)', () => {
  describe('isReservedConfigKey / reservedNamespaceOf', () => {
    it.each(RESERVED_KEYS)('treats %p as reserved', (key) => {
      expect(isReservedConfigKey(key)).toBe(true);
      expect(reservedNamespaceOf(key)).toBe('financial');
    });

    it.each([
      'school.logo',
      'branding.logo',
      'regional.locale',
      'module.finance.enabled',
      'automation.approval_chain',
      'financials.tax',
      'xfinancial.tax',
      'regional.financial',
      '',
    ])('does NOT treat %p as reserved', (key) => {
      expect(isReservedConfigKey(key)).toBe(false);
      expect(reservedNamespaceOf(key)).toBeNull();
    });

    it('throws ForbiddenException naming the owning domain', () => {
      expect(() => assertNotReservedConfigKey('financial.tax', 'configuration')).toThrow(
        ForbiddenException,
      );
      expect(() => assertNotReservedConfigKey('financial.tax', 'configuration')).toThrow(
        /owned by the Finance domain/,
      );
    });

    it('does not throw for an Institution-owned key', () => {
      expect(() => assertNotReservedConfigKey('school.logo', 'configuration')).not.toThrow();
    });
  });

  describe('InstitutionConfigurationsService', () => {
    it('refuses to CREATE a financial.* key and performs no write', async () => {
      const { mocks, service } = configurationHarness();

      await expect(
        service.upsert('t1', 'i1', 'financial.tax.default_rate', { value: 7.5 }, 'actor-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mocks.institutionConfiguration.create).not.toHaveBeenCalled();
      expect(mocks.institutionConfiguration.update).not.toHaveBeenCalled();
    });

    it('refuses to UPDATE a financial.* key and performs no write', async () => {
      const { mocks, service } = configurationHarness();
      mocks.institutionConfiguration.findFirst.mockResolvedValue({ id: 'row-1', version: 3 });

      await expect(
        service.upsert('t1', 'i1', 'financial.currency', { value: 'USD', version: 3 }, 'actor-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mocks.institutionConfiguration.update).not.toHaveBeenCalled();
      expect(mocks.institutionConfiguration.create).not.toHaveBeenCalled();
    });

    it('refuses to REMOVE a financial.* key and performs no write', async () => {
      const { mocks, service } = configurationHarness();
      mocks.institutionConfiguration.findFirst.mockResolvedValue({ id: 'row-1', version: 1 });

      await expect(service.remove('t1', 'i1', 'financial.tax', 'actor-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(mocks.institutionConfiguration.delete).not.toHaveBeenCalled();
    });

    it('still returns NotFound for an ABSENT financial.* key (existing contract preserved)', async () => {
      const { mocks, service } = configurationHarness();
      mocks.institutionConfiguration.findFirst.mockResolvedValue(null);

      await expect(service.remove('t1', 'i1', 'financial.tax', 'actor-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mocks.institutionConfiguration.delete).not.toHaveBeenCalled();
    });

    it('leaves Institution-owned keys writable (school.logo unchanged)', async () => {
      const { mocks, service } = configurationHarness();
      mocks.institutionConfiguration.findFirst.mockResolvedValue(null);
      mocks.institutionConfiguration.create.mockResolvedValue({ id: 'row-2', version: 1 });

      await service.upsert('t1', 'i1', 'school.logo', { value: '#2563EB' }, 'actor-1');

      expect(mocks.institutionConfiguration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ key: 'school.logo', version: 1 }),
        }),
      );
    });

    it('leaves reads untouched so display/projection reads still work', async () => {
      const { mocks, service } = configurationHarness();
      mocks.institutionConfiguration.findFirst.mockResolvedValue({ id: 'row-1', value: 7.5 });

      await expect(service.findByKey('t1', 'i1', 'financial.tax')).resolves.toBeDefined();
    });
  });

  describe('InstitutionSettingsService', () => {
    it('refuses to CREATE a financial.* key and performs no write', async () => {
      const { mocks, service } = settingsHarness();

      await expect(
        service.upsert('t1', 'i1', 'financial.payment_gateways.paystack.secret_key', {
          value: 'sk_live_xxx',
        }, 'actor-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mocks.institutionSetting.create).not.toHaveBeenCalled();
      expect(mocks.institutionSetting.update).not.toHaveBeenCalled();
    });

    it('refuses to UPDATE a financial.* key and performs no write', async () => {
      const { mocks, service } = settingsHarness();
      mocks.institutionSetting.findFirst.mockResolvedValue({ id: 'row-1', version: 2 });

      await expect(
        service.upsert('t1', 'i1', 'financial.numbering.invoice', { value: 1, version: 2 }, 'actor-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mocks.institutionSetting.update).not.toHaveBeenCalled();
      expect(mocks.institutionSetting.create).not.toHaveBeenCalled();
    });

    it('refuses to REMOVE a financial.* key and performs no write', async () => {
      const { mocks, service } = settingsHarness();
      mocks.institutionSetting.findFirst.mockResolvedValue({ id: 'row-1', version: 1 });

      await expect(service.remove('t1', 'i1', 'financial.tax', 'actor-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(mocks.institutionSetting.delete).not.toHaveBeenCalled();
    });

    it('still returns NotFound for an ABSENT financial.* key (existing contract preserved)', async () => {
      const { mocks, service } = settingsHarness();
      mocks.institutionSetting.findFirst.mockResolvedValue(null);

      await expect(service.remove('t1', 'i1', 'financial.tax', 'actor-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mocks.institutionSetting.delete).not.toHaveBeenCalled();
    });

    it('leaves Institution-owned keys writable (sms.provider unchanged)', async () => {
      const { mocks, service } = settingsHarness();
      mocks.institutionSetting.findFirst.mockResolvedValue(null);
      mocks.institutionSetting.create.mockResolvedValue({ id: 'row-3', version: 1 });

      await service.upsert('t1', 'i1', 'sms.provider', { value: 'twilio' }, 'actor-1');

      expect(mocks.institutionSetting.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ key: 'sms.provider', version: 1 }),
        }),
      );
    });
  });
});
